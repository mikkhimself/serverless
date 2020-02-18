const rp = require('request-promise')

module.exports.run = async function(event, context, callback) {
  const body = JSON.parse(event.body)
  const { secret } = body

  if (!secret || secret !== process.env.DEPLOY_SECRET) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid secret' }),
    })
  }

  try {
    await rp({
      method: 'POST',
      uri: 'https://api.github.com/repos/intrative/intrative/dispatches',
      headers: {
        Accept: 'application/vnd.github.everest-preview+json',
        'Content-Type': 'application/json',
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'request',
      },
      json: true,
      body: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        event_type: 'update',
      },
    })
    return callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Great success' }),
    })
  } catch (error) {
    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Oh no :( Could not trigger a deploy!',
        error: error,
      }),
    })
  }
}