# Install
```
tns plugin add tns-mobileauth
```

## Params
`origin`: origin url of server

`lang`: function returning string by attribute.

`test`: if working on test set true to get console messages.

## API

`getSessionFile`: returns session file from phone

`getClientSession(success,fail)`: runs success() if session file has the right format else runs fail()

`ifSessionOk(uri,ifOk,ifNotOk)`: verify session and return user data

`login(uri,user,success,fail)`: login

`logout(callback)`: logout

`postWithSession(uri,json,success,fail)`: posts data in operation property and adds session to verify it on server
