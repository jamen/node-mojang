const test = require('ava')
const nock = require('nock')
const {setSkin} = require('../..')

// API behavior observed 28.08.2017 by maccelerated
test('resolves when access token, profile, and URL are valid', async t => {
  nock('https://api.mojang.com', {
    reqheaders: {
      'authorization': 'Bearer goodaccesstoken',
      'content-type': 'application/x-www-form-urlencoded'
    }
  }).post(`/user/profile/7ddf32e17a6ac5ce04a8ecbf782ca509/skin`, 'model=&url=urlOfPNG')
    .reply(204)

  await setSkin('goodaccesstoken', '7ddf32e17a6ac5ce04a8ecbf782ca509', 'urlOfPNG')
  t.pass()
})

// API behavior observed 28.08.2017 by maccelerated
test('Optionally sends slim skin type when selected', async t => {
  nock('https://api.mojang.com', {
    reqheaders: {
      'authorization': 'Bearer goodaccesstoken',
      'content-type': 'application/x-www-form-urlencoded'
    }
  }).post(`/user/profile/7ddf32e17a6ac5ce04a8ecbf782ca509/skin`, 'model=slim&url=urlOfPNG')
    .reply(204)

  await setSkin('goodaccesstoken', '7ddf32e17a6ac5ce04a8ecbf782ca509', 'urlOfPNG', true)
  t.pass()
})

// API behavior observed 28.08.2017 by maccelerated
test('rejects when URL is bad', async t => {
  nock('https://api.mojang.com', {
    reqheaders: {
      'authorization': 'Bearer goodaccesstoken',
      'content-type': 'application/x-www-form-urlencoded'
    }
  }).post(`/user/profile/7ddf32e17a6ac5ce04a8ecbf782ca509/skin`, 'model=&url=badURL')
    .reply(400, {
      'error': 'IllegalArgumentException',
      'errorMessage': 'Content is not an image'
    })

  const err = await t.throws(setSkin('goodaccesstoken', '7ddf32e17a6ac5ce04a8ecbf782ca509', 'badURL'))
  t.is(err.name, 'IllegalArgumentException')
  t.is(err.message, 'Content is not an image')
})

// API behavior observed 28.08.2017 by maccelerated
test('rejects when access token is bad', async t => {
  nock('https://api.mojang.com', {
    reqheaders: {
      'authorization': 'Bearer badaccesstoken',
      'content-type': 'application/x-www-form-urlencoded'
    }
  }).post(`/user/profile/7ddf32e17a6ac5ce04a8ecbf782ca509/skin`, 'model=&url=urlOfPNG')
    .reply(401, {
      'error': 'Unauthorized',
      'errorMessage': 'The request requires user authentication'
    })

  const err = await t.throws(setSkin('badaccesstoken', '7ddf32e17a6ac5ce04a8ecbf782ca509', 'urlOfPNG'))
  t.is(err.name, 'Unauthorized')
  t.is(err.message, 'The request requires user authentication')
})
