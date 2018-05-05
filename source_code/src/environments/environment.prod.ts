export const environment = {
  production: true,
  isMobile: true,
  //configuration url api
  dummyUrl: 'https://5993b773d297ba0011da1acc.mockapi.io/',
  apiUrl: 'http://103.18.6.158:1111/api/',
  //apiUrl: 'http://192.168.100.44:8034/api/',
  //apiUrl: 'http://localhost:3000/api/',
  useLocalJson: false,
  ignoreHeader: ['login', 'register'],
  page: 1,
  limit: 30,
  //config firebase
  firebaseConfig: {
    apiKey: "AIzaSyAsc7gSaMaX2SqibMbbi-NkY_GuqBfvwUI",
    authDomain: "poland-app-aa4b3.firebaseapp.com",
    databaseURL: "https://poland-app-aa4b3.firebaseio.com",
    projectId: "poland-app-aa4b3",
    storageBucket: "poland-app-aa4b3.appspot.com",
    messagingSenderId: "702484809342"
  },
  layout: {
    'headerHeight': 45,
    'footerHeight': 60,
    'advHeight': 45,
  },
  geolocation: {
    interval: (1*60*60*1000),//30 second will check and get position
  },
  timeout: 6000, //second connection timeout
  defaultLat: 35.652832,
  defaultLong: 139.839478
};
