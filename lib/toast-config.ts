import { toast } from 'react-toastify'

// Configuração padrão para todos os toasts
const toastConfig = {
  position: "top-right" as const,
  autoClose: 5000, // Aumentado para 5 segundos
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark" as const,
}

// Funções helper para mostrar toasts específicos
export const showToast = {
  // Toast de sucesso
  success: (message: string) => {
    toast.success(message, toastConfig)
  },

  // Toast de erro
  error: (message: string) => {
    toast.error(message, toastConfig)
  },

  // Toast de aviso
  warning: (message: string) => {
    toast.warning(message, toastConfig)
  },

  // Toast de informação
  info: (message: string) => {
    toast.info(message, toastConfig)
  },

  // Toast específico para download iniciado
  downloadStarted: (productName: string, type: string) => {
    toast.success(`Download iniciado: ${productName} (${type})`, toastConfig)
  },

  // Toast específico para erro no download
  downloadError: (error: string) => {
    toast.error(`Erro no download: ${error}`, toastConfig)
  },

  // Toast para usuário não logado
  userNotLoggedIn: () => {
    toast.warning("Você precisa estar logado para fazer downloads", toastConfig)
  },

  // Toast para conta criada
  accountCreated: () => {
    toast.success("Conta criada com sucesso! Faça login para continuar.", toastConfig)
  },

  // Toast para erro genérico
  genericError: (message: string) => {
    toast.error(message, toastConfig)
  },
} 