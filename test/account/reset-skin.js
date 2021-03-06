const test = require('ava')
const nock = require('nock')
const {resetSkin} = require('../..')

// API behavior observed 28.08.2017 by maccelerated
test('resolves when access token, profile', async t => {
  const accessToken = 'goodaccesstoken'

  nock('https://api.mojang.com', {
    reqheaders: {
      'authorization': `Bearer ${accessToken}`
    }
  })
    .delete(`/user/profile/7ddf32e17a6ac5ce04a8ecbf782ca509/skin`)
    .reply(204)

  await resetSkin({accessToken}, '7ddf32e17a6ac5ce04a8ecbf782ca509')
  t.pass()
})

// This is prevented by using the security location endpoint first.
// API behavior observed 28.08.2017 by maccelerated
test('rejects when IP is not secured', async t => {
  const accessToken = 'goodaccesstoken'

  nock('https://api.mojang.com', {
    reqheaders: {
      'authorization': 'Bearer goodaccesstoken'
    }
  })
    .delete(`/user/profile/7ddf32e17a6ac5ce04a8ecbf782ca509/skin`)
    .reply(403, {
      'error': 'Forbidden',
      'errorMessage': 'Current IP not secured'
    })

  const err = await t.throws(resetSkin({accessToken}, '7ddf32e17a6ac5ce04a8ecbf782ca509'))
  t.is(err.name, 'Forbidden')
  t.is(err.message, 'Current IP not secured')
})

// API behavior observed 30.08.2017 by maccelerated
test('rejects when access token is invalid', async t => {
  const accessToken = 'badaccesstoken'

  nock('https://api.mojang.com', {
    reqheaders: {
      'authorization': `Bearer ${accessToken}`
    }
  })
    .delete(`/user/profile/a984c00af9274878820fce723d73a0ca/skin`)
    .reply(401, {
      'error': 'Unauthorized',
      'errorMessage': 'The request requires user authentication'
    }, {
      'WWW-Authenticate': 'Bearer realm="Mojang", error="invalid_token", error_description="The access token is invalid"'
    })

  const err = await t.throws(resetSkin({accessToken}, 'a984c00af9274878820fce723d73a0ca'))
  t.is(err.message, 'The access token is invalid')
  t.is(err.name, 'Unauthorized')
})
