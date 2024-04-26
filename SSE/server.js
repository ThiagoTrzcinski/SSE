const http = require('http');
const fs = require('fs');

let votes = {
  option1: 0,
  option2: 0,
};

function updateVotes(option) {
  if (option === 'option1' || option === 'option2') {
    votes[option]++;
    broadcastVotes();
  }
}

function broadcastVotes() {
  const data = `data: ${JSON.stringify(votes)}\n\n`;
  clients.forEach(client => client.res.write(data));
}

const clients = [];

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(__dirname + '/index.html').pipe(res);
  }

  else if (req.url === '/vote' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { option } = JSON.parse(body);
      updateVotes(option);
      res.end();
    });
  }

  else if (req.url === '/votes') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');
    clients.push({ res });
    req.on('close', () => {
      clients.splice(clients.indexOf({ res }), 1);
    });
  }
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
