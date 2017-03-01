import requests
r = requests.post("http://localhost:6020/users/auth", json= {
  "connectionData": {},
  "authData": { "username": "ian fox", "password": "1234" }
})

r = requests.post("http://localhost:6021/users", json= {
  "username": "ian", "password": "1234", "phone": "1234", "countryCode": "1"
})

r = requests.post("http://localhost:6021/users", json= {
  "username": "nodeserver", "password": "1234", "phone": "1235", "countryCode": "1"
})

r = requests.post("http://localhost:6021/users", json= {
  "username": "aaron", "password": "1234", "phone": "1236", "countryCode": "1"
})

r = requests.post("http://localhost:6021/users", json= {
  "username": "rahul", "password": "1234", "phone": "1237", "countryCode": "1"
})

r = requests.post("http://localhost:6021/users", json= {
  "username": "yigal", "password": "1234", "phone": "1238", "countryCode": "1"
})