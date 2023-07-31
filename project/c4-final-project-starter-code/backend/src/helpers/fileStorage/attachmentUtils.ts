import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export class AttachmentUtils {

  constructor(
    private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
  ) { }

  public async createAttachmentURL(todoId: string) {
    var url = `https://${this.s3BucketName}.s3.amazonaws.com/${todoId}`
    return url
  }

  getAttachmentUrl(todoId: string) {
    console.log("Get AttachmentUrl called")
    return s3.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}
