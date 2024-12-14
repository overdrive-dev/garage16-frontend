'use client'

// ... imports existentes ...

export default function ResetPasswordPage() {
  // ... código existente ...

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-gray-400">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* ... campos do formulário ... */}

          <div className="text-center">
            <Link 
              href="/entrar"
              className="text-orange-500 hover:text-orange-400 text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
} 