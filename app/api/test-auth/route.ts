import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando autenticação...')
    
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    console.log('🔍 Debug - session:', session)
    console.log('🔍 Debug - session?.user:', session?.user)
    console.log('🔍 Debug - session?.user?.id:', (session?.user as any)?.id)
    
    if (!session) {
      console.log('🔍 Debug - Sem session')
      return NextResponse.json(
        { error: 'Sem session', session: null },
        { status: 401 }
      )
    }
    
    if (!(session.user as any)?.id) {
      console.log('🔍 Debug - Sem userId')
      return NextResponse.json(
        { error: 'Sem userId', session: session, user: session.user },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id as string
    console.log('🔍 Debug - userId:', userId)
    
    return NextResponse.json({
      success: true,
      message: 'Autenticação funcionando!',
      userId,
              session: {
          user: {
            id: (session.user as any).id,
            email: (session.user as any).email,
            name: (session.user as any).name
          }
        }
    })

  } catch (error) {
    console.error('❌ Erro na API de teste:', error)
    return NextResponse.json(
      { error: 'Erro interno', details: error },
      { status: 500 }
    )
  }
} 