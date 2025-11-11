
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
import { useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useFirebase, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';

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
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`) as DocumentReference<UserProfile>;
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // Create user profile if it doesn't exist
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(
          userRef,
          {
            displayName: user.displayName || 'Anonymous',
            email: user.email || '',
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
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
