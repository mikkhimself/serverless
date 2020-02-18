const rp = require('request-promise')
const sendEmail = require('./sendEmail')

module.exports.run = async (event, context, callback) => {
  const body = JSON.parse(event.body)
  const { name, email, budget, message, attachment } = body

  if (!name) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: 'Name is required' }),
    })
  }

  if (!email) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: 'Email address is required' }),
    })
  }

  if (!message) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: 'Message is required' }),
    })
  }

  return Promise.all([
    sendEmail({
      to: 'Intrative <hello@intrative.co>',
      subject: '[Intrative] New enquiry received!',
      data:
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Budget: ${budget || 'n/a'}\n` +
        `Attachment: ${attachment || 'n/a'}\n` +
        `\n${message}`,
    }),
    sendEmail({
      to: `${name} <${email}>`,
      subject: 'Your message was delivered at Intrative',
      data:
        'Thanks for reaching out!\n' +
        'Somebody at our office will get back to you as soon as possible.\n' +
        '\n' +
        'While you wait, check out our Handbook (https://intrative.co/handbook/) and get acquainted with how we do things around here.\n' +
        'We have a lot of content there so feel free to explore as you please.\n' +
        '\n' +
        'Speak soon,\n' +
        'Intrative\n',
    }),
    rp({
      method: 'POST',
      uri: `https://hooks.slack.com/${process.env.SLACK_PATH}`,
      json: true,
      body: {
        text: `<!channel> New enquiry received`,
        attachments: [
          {
            fallback: 'Information:',
            pretext: 'Information:',
            color: '#FF5050',
            fields: [
              { title: 'Name', value: name, short: false },
              { title: 'Email', value: email, short: false },
              { title: 'Budget', value: budget || 'n/a', short: false },
              { title: 'Attachment', value: attachment || 'n/a', short: false },
              { title: 'Message', value: message || 'n/a', short: false },
            ],
          },
        ],
      },
    }),
  ])
    .then(() => {
      return callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Great success' }),
      })
    })
    .catch(err => {
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Oh no :( Message not delivered',
          error: err,
        }),
      })
    })
}