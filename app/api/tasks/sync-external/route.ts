import { NextRequest, NextResponse } from 'next/server'
import { db as supabase } from '@/lib/db/sqlserver'
import { getCurrentUser } from '@/lib/auth'
import { createTaskManagementClient } from '@/lib/task-management/factory'
import type { TaskManagementConfig } from '@/lib/task-management/types'

export async function POST(request: NextRequest) {
  try {
    console.log(' ========== EXTERNAL TASK SYNC START ==========')
    
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { task_id, provider } = await request.json()
    console.log(' Syncing task:', task_id, 'to provider:', provider)

    // supabase = db (bound from @/lib/db/sqlserver)

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, analyses(repository_name)')
      .eq('id', task_id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }

    // Get integration token for the selected provider
    const { data: token, error: tokenError } = await supabase
      .from('github_tokens')
      .select('*')
      .eq('client_id', task.client_id)
      .eq('provider', provider)
      .eq('is_active', true)
      .single()

    if (tokenError || !token) {
      return NextResponse.json(
        { error: `Token para ${provider} não encontrado. Configure a integração primeiro.` },
        { status: 400 }
      )
    }

    // Create task management client
    const config: TaskManagementConfig = {
      provider: provider as any,
      token: token.access_token,
      organization: token.organization || token.account_name,
      project: task.analyses?.repository_name,
      workspace: token.organization
    }

    const client = createTaskManagementClient(config)

    // Create task in external system
    const result = await client.createTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assignee: task.assigned_to,
      labels: ['cnpj-migration'],
      codeContext: task.code_current ? {
        file: task.file_path,
        line: task.line_number,
        language: task.file_language || 'text',
        codeBefore: task.code_before?.join('\n') || '',
        codeCurrent: task.code_current,
        codeSuggested: task.code_suggested || '',
        codeAfter: task.code_after?.join('\n') || '',
        repository: task.analyses?.repository_name || ''
      } : undefined
    })

    console.log(' External task created:', result.key, result.url)

    // Update task with external references
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        external_task_id: result.id,
        external_task_url: result.url,
        external_provider: provider,
        external_task_key: result.key
      })
      .eq('id', task_id)

    if (updateError) {
      console.error(' Error updating task:', updateError)
    }

    console.log(' ========== EXTERNAL TASK SYNC SUCCESS ==========')

    return NextResponse.json({
      success: true,
      task_id: result.id,
      task_key: result.key,
      task_url: result.url,
      provider: result.provider
    })
  } catch (error) {
    console.error(' External task sync error:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar com sistema externo' },
      { status: 500 }
    )
  }
}
