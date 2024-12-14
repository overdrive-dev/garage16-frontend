'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  getFirestore 
} from 'firebase/firestore';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from '@/components/ui/toast';

const AuthContext = createContext({});
const db = getFirestore();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Função para definir o cookie de autenticação
  const setAuthCookie = async (user) => {
    if (user) {
      const token = await user.getIdToken();
      Cookies.set('firebase-auth-token', token, { 
        expires: 7, // 7 dias
        path: '/',
        sameSite: 'lax'
      });
    } else {
      Cookies.remove('firebase-auth-token', { path: '/' });
    }
  };

  // Função para verificar se o perfil está completo
  const isProfileComplete = (userData) => {
    // Se já completou o perfil uma vez, não precisa completar novamente
    if (userData?.perfilCompleto) {
      return true;
    }

    // Verifica se tem os dados necessários
    const complete = !!(
      userData?.whatsapp &&
      userData?.enderecos?.some(e => e.principal)
    );

    console.log('Verificando perfil completo:', { userData, complete });
    return complete;
  };

  const handleAuthRedirect = async (userData) => {
    // Se não tiver dados do Firestore, busca eles primeiro
    if (!userData.whatsapp) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userData.uid));
        const firestoreData = userDoc.data();
        userData = { ...userData, ...firestoreData };
        console.log('Dados do Firestore:', firestoreData);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    }

    if (!isProfileComplete(userData)) {
      console.log('Perfil incompleto, redirecionando para /completar-cadastro');
      router.push('/completar-cadastro');
      return;
    }

    console.log('Perfil completo, seguindo fluxo normal');
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get('callbackUrl');
    
    if (callbackUrl && !callbackUrl.includes('/(auth)')) {
      router.push(callbackUrl);
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await setAuthCookie(user);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();

          const normalizedUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL,
            providerId: user.providerId,
            providerData: user.providerData,
            ...userData
          };

          setUser(normalizedUser);

          // Verifica se o perfil está completo e redireciona se necessário
          const currentPath = window.location.pathname;
          if (!isProfileComplete(normalizedUser) && currentPath !== '/completar-cadastro') {
            console.log('Perfil incompleto detectado no onAuthStateChanged');
            router.push('/completar-cadastro');
            return;
          }

        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setUser(null);
          Cookies.remove('firebase-auth-token', { path: '/' });
        }
      } else {
        setUser(null);
        Cookies.remove('firebase-auth-token', { path: '/' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await setAuthCookie(userCredential.user);
      await handleAuthRedirect(userCredential.user);
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const { email, password, ...profileData } = formData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualiza os dados adicionais do usuário
      await updateUserProfile(profileData);
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await setAuthCookie(result.user);

      // Busca dados do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const userData = userDoc.data();

      const normalizedUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email?.split('@')[0],
        photoURL: result.user.photoURL,
        providerId: result.user.providerId,
        providerData: result.user.providerData,
        ...userData
      };

      // Atualiza o estado do usuário
      setUser(normalizedUser);

      // Verifica se precisa completar o perfil
      if (!isProfileComplete(normalizedUser)) {
        console.log('Perfil incompleto após login com Google');
        router.push('/completar-cadastro');
        return result;
      }

      await handleAuthRedirect(normalizedUser);
      return result;
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('Esta conta já existe. Por favor, faça login com o método original.');
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        throw new Error('Login cancelado pelo usuário.');
      } else {
        console.error('Erro no login com Google:', error);
        throw new Error('Erro ao fazer login com Google. Tente novamente.');
      }
    }
  };

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      Cookies.remove('firebase-auth-token', { path: '/' });
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const confirmPasswordReset = (oobCode, newPassword) => {
    return confirmPasswordReset(auth, oobCode, newPassword);
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (!auth.currentUser) throw new Error('Usuário não autenticado');

      // Atualiza o displayName no Auth se fornecido
      if (profileData.nome) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.nome
        });
      }

      // Verifica se está completando o perfil pela primeira vez
      const isCompletingProfile = !!(
        profileData.whatsapp &&
        user?.enderecos?.some(e => e.principal)
      );

      // Prepara os dados para salvar no Firestore
      const firestoreData = {
        nome: profileData.nome,
        whatsapp: profileData.whatsapp,
        notificacoes: profileData.notificacoes,
        updatedAt: new Date().toISOString()
      };

      // Se estiver completando o perfil pela primeira vez, marca como completo
      if (isCompletingProfile) {
        firestoreData.perfilCompleto = true;
      }

      // Salva os dados adicionais no Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, firestoreData, { merge: true });

      // Atualiza o estado local do usuário
      setUser(prev => ({
        ...prev,
        displayName: profileData.nome,
        nome: profileData.nome,
        whatsapp: profileData.whatsapp,
        notificacoes: profileData.notificacoes,
        perfilCompleto: isCompletingProfile ? true : prev?.perfilCompleto
      }));

      toast.success('Perfil atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
      throw error;
    }
  };

  const saveEndereco = async (endereco, enderecoId = null) => {
    try {
      if (!auth.currentUser) throw new Error('Usuário não autenticado');

      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      let enderecos = userData?.enderecos || [];

      if (enderecoId) {
        // Atualiza endereço existente
        enderecos = enderecos.map(e => 
          e.id === enderecoId ? { ...endereco, id: enderecoId } : e
        );
      } else {
        // Adiciona novo endereço
        enderecos.push({
          ...endereco,
          id: Date.now().toString()
        });
      }

      // Se o endereço for principal, remove o principal dos outros
      if (endereco.principal) {
        enderecos = enderecos.map(e => ({
          ...e,
          principal: e.id === (enderecoId || enderecos[enderecos.length - 1].id)
        }));
      }

      await setDoc(userRef, {
        enderecos,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Atualiza o estado local do usuário
      setUser(prev => ({
        ...prev,
        enderecos
      }));

      toast.success('Endereço salvo com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      toast.error('Erro ao salvar endereço. Tente novamente.');
      throw error;
    }
  };

  const deleteEndereco = async (enderecoId) => {
    try {
      if (!auth.currentUser) throw new Error('Usuário não autenticado');

      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      let enderecos = userData?.enderecos || [];

      // Remove o endereço
      enderecos = enderecos.filter(e => e.id !== enderecoId);

      // Se não houver mais endereços principais, define o primeiro como principal
      if (enderecos.length > 0 && !enderecos.some(e => e.principal)) {
        enderecos[0].principal = true;
      }

      await setDoc(userRef, {
        enderecos,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Atualiza o estado local do usuário
      setUser(prev => ({
        ...prev,
        enderecos
      }));

      toast.success('Endereço excluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir endereço:', error);
      toast.error('Erro ao excluir endereço. Tente novamente.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      logout,
      resetPassword,
      updateUserProfile,
      isProfileComplete,
      confirmPasswordReset,
      saveEndereco,
      deleteEndereco
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 