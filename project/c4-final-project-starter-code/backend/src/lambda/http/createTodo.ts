import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodos } from '../../helpers/businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    console.log('Processing event: ', event)
    const userId = getUserId(event)
    const newItems = await createTodos(newTodo, userId)

    return {
        statusCode: 201,
        body: JSON.stringify({
            item: newItems
        })
    }
  }
)

handler.use(
    cors({
        credentials: true
    })
)
