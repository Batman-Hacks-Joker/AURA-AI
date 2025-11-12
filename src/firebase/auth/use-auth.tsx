'use client';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  DocumentReference,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useFirebaseAuth, useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export type Role = 'admin' | 'customer';

// Define the shape of the user profile data
export interface UserProfile {
  displayName: string;
  email: string;
  createdAt: any; // Use 'any' for serverTimestamp
}

// Define the context state
interface AuthContextState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: Role | null;
  signIn: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/login/admin')) {
      setRole('admin');
    } else if (pathname.startsWith('/login/customer')) {
      setRole('customer');
    } else if (localStorage.getItem('userRole')) {
      setRole(localStorage.getItem('userRole') as Role);
    }
  }, [pathname]);

  const userDocRef = useMemo(() => {
    if (!user || !firestore || !role) return null;
    const collectionName = role === 'admin' ? 'admins' : 'customers';
    return doc(firestore, `${collectionName}/${user.uid}`) as DocumentReference<UserProfile>;
  }, [user, firestore, role]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async (selectedRole: Role) => {
    setRole(selectedRole);
    localStorage.setItem('userRole', selectedRole);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      if (loggedInUser) {
        const collectionName = selectedRole === 'admin' ? 'admins' : 'customers';
        const userRef = doc(firestore, collectionName, loggedInUser.uid);
        const profileData = {
          displayName: loggedInUser.displayName || 'Anonymous',
          email: loggedInUser.email || '',
          createdAt: serverTimestamp(),
        };

        // Use non-blocking setDoc with error handling
        setDoc(userRef, profileData, { merge: true })
          .catch(error => {
            const permissionError = new FirestorePermissionError({
              path: userRef.path,
              operation: 'write',
              requestResourceData: profileData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      localStorage.removeItem('userRole');
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      setRole(null);
      router.push('/login');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile: userProfile as UserProfile | null,
        loading,
        role,
        signIn,
        signOut: logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
