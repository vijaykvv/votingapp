// var express = require('express'),
//     async = require('async'),
//     { Pool } = require('pg'),
//     cookieParser = require('cookie-parser'),
//     app = express(),
//     server = require('http').Server(app),
//     io = require('socket.io')(server);

// var port = process.env.PORT || 4000;

// io.on('connection', function (socket) {

//   socket.emit('message', { text : 'Welcome!' });

//   socket.on('subscribe', function (data) {
//     socket.join(data.channel);
//   });
// });

// var pool = new Pool({
//   connectionString: 'postgres://postgres:postgres@db/postgres'
// });

// async.retry(
//   {times: 1000, interval: 1000},
//   function(callback) {
//     pool.connect(function(err, client, done) {
//       if (err) {
//         console.error("Waiting for db");
//       }
//       callback(err, client);
//     });
//   },
//   function(err, client) {
//     if (err) {
//       return console.error("Giving up");
//     }
//     console.log("Connected to db");
//     getVotes(client);
//   }
// );

// function getVotes(client) {
//   client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote', [], function(err, result) {
//     if (err) {
//       console.error("Error performing query: " + err);
//     } else {
//       var votes = collectVotesFromResult(result);
//       io.sockets.emit("scores", JSON.stringify(votes));
//     }

//     setTimeout(function() {getVotes(client) }, 1000);
//   });
// }

// function collectVotesFromResult(result) {
//   var votes = {a: 0, b: 0};

//   result.rows.forEach(function (row) {
//     votes[row.vote] = parseInt(row.count);
//   });

//   return votes;
// }

// app.use(cookieParser());
// app.use(express.urlencoded());
// app.use(express.static(__dirname + '/views'));

// app.get('/', function (req, res) {
//   res.sendFile(path.resolve(__dirname + '/views/index.html'));
// });

// server.listen(port, function () {
//   var port = server.address().port;
//   console.log('App running on port ' + port);
// });

var express = require('express'),
    async = require('async'),
    { Pool } = require('pg'),
    cookieParser = require('cookie-parser'),
    path = require('path'), // Ensure 'path' is imported
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var port = process.env.PORT || 4000;

io.on('connection', function (socket) {
  socket.emit('message', { text: 'Welcome!' });

  socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });
});

var pool = new Pool({
  connectionString: 'postgres://postgres:postgres@db/postgres'
});

async.retry(
  { times: 1000, interval: 1000 },
  function (callback) {
    pool.connect(function (err, client, done) {
      if (err) {
        console.error("Waiting for db");
      }
      callback(err, client);
    });
  },
  function (err, client) {
    if (err) {
      return console.error("Giving up");
    }
    console.log("Connected to db");
    getVotes(client);
  }
);

function getVotes(client) {
  client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote', [], function (err, result) {
    if (err) {
      console.error("Error performing query: " + err);
    } else {
      var votes = collectVotesFromResult(result);
      io.sockets.emit("scores", JSON.stringify(votes));
    }

    setTimeout(function () { getVotes(client) }, 1000);
  });
}

function collectVotesFromResult(result) {
  var votes = { a: 0, b: 0 };

  result.rows.forEach(function (row) {
    votes[row.vote] = parseInt(row.count);
  });

  return votes;
}

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Ensure extended option is set
app.use(express.static(path.join(__dirname, 'views'))); // Use path.join for portability

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'views', 'index.html')); // Use path.resolve for portability
});

app.post('/vote', function (req, res) {
  const vote = req.body.vote;

  // Validate the vote
  if (!vote || (vote !== 'a' && vote !== 'b')) {
    return res.status(400).send('Invalid vote');
  }

  // Insert the vote into the database
  pool.query('INSERT INTO votes (vote) VALUES ($1)', [vote], function (err) {
    if (err) {
      console.error('Error inserting vote: ' + err);
      return res.status(500).send('Internal Server Error');
    }

    res.status(200).send('Vote counted');
  });
});

server.listen(port, function () {
  console.log('App running on port ' + port);
});