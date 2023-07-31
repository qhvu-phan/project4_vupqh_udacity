import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'
import { TodoUpdate } from '../../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  public async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  public async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  public async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate) {
    if (userId) {
      logger.info("Update todo")
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":name": updatedTodo.name,
          ":dueDate": updatedTodo.dueDate,
          ":done": updatedTodo.done
        }
      }).promise()
      logger.error("Update success")
    }
    else {
      logger.error("Update failed")
    }
  }

  public async deleteTodosByTodoId(userId: string, todoId: string) {
    if (userId) {
      logger.info("Get todo id for delete ${todoId}")
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      }).promise()
    }
    else {
      logger.error("Delete error");
    }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
