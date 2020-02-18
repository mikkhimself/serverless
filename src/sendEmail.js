const AWS = require('aws-sdk')

const s3 = new AWS.S3()

module.exports.run = (event, context, callback) => {
  const body = JSON.parse(event.body)
  const { name, type } = body

  if (!name) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: 'Filename is required' }),
    })
  }

  if (!type) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: 'Filetype (MIME) is required' }),
    })
  }

  const config = {
    Bucket: process.env.UPLOAD_BUCKET,
    Key: name,
    ContentType: type,
    ACL: 'public-read',
  }

  s3.getSignedUrl('putObject', config, (err, url) => {
    if (err) {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Could not get signed URL',
          error: err,
        }),
      })
    } else {
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ url: url }),
      })
    }
  })
}