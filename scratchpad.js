function logger() {
  var string = 'https://signon.service-now.com/ssologin.do';
  var loc = window.location.href
  console.log(loc);
  console.log('LOT THIS IS');
  if (loc.match(string) {
    console.log('IN logger');
    document.getElementById('username').innerHTML = 'georgi.klifov@paysafe.com';
    document.getElementById('password').innerHTML = 'AlfaBeta79$$$';
    document.getElementById('submitButton').click();
  } 
  else
  {
    goToSignIn();
  }
}
