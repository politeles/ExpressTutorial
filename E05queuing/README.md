# Express application with Python app and Queuing

## Get started!

Copy the folder from the previous session.
[Download RabbitMQ for windows. ](https://www.rabbitmq.com/install-windows-manual.html) The recommendation is to use a package manager to get automated updates, but just for the shake of this example, we will get the binary installer.

### Install Erlang first!
enjoy your time installing this solution by [installing first Erlang for windows](https://www.rabbitmq.com/which-erlang.html). Once Erlang installation is completed, we can install RabbitMQ.

There is a compability matrix, not all versions of Erlang are supported in RabbitMQ.
The process to install Erlang in windows is straight forward, follow the installer options and you are ready to go.

*Set up the ERLANG_HOME* Go to Start > Settings > Control Panel > System > Advanced > Environment Variables. Create the system environment variable ERLANG_HOME and set it to the full path of the directory which contains bin\erl.exe.

Once you set up that, check the variable:

```cmd
C:\Users\Jose Enrique>echo %ERLANG_HOME%
C:\Program Files\erl-23.2.7\bin
```


### Install rabbitmq
Download the application zip file, move it to the program file folder and setup the environment variables as described in the install documentation.

For testing purposes, you can start the server in the cmd console (Run as Admin):

```cmd
C:\WINDOWS\system32>cd C:\Program Files\RabbitMQ\sbin

C:\Program Files\RabbitMQ\sbin>rabbitmq-server.bat
```


## Running the example
In this example we will implement two processes:
 - A nodeJS server.
 - A python background process.


### Node JS part

We need to install a new library to connect to RabbitMQ. We are building a sample version of the [send.js file.](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/javascript-nodejs/src/send.js)

```
npm install amqplib
```


The NodeJS process will send a request to the python program every time we access the main page.
Let's modify the file app/controllers/home.js to add the dependency:

```
var amqp = require('amqplib/callback_api');

```

Now, we create the call to connect to Rabbit, select the queue and send the message from line 28:

```
router.get('/', (req, res, next) => {
	
	// create background job
	amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'hello';
        var msg = 'Hello World!';

        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(msg));

        console.log(" [x] Sent %s", msg);
    });
    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
});


```


### Create the python application:
we need to install the python library
```
python -m pip install pika --upgrade
```

The example is the [receiver from rabbit examples](https://github.com/rabbitmq/rabbitmq-tutorials/blob/master/python/receive.py)
There are two main things to be observed: the queue declare function and the basic_consume function.
