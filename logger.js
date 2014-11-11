module.exports =
(function () {
	"use strict";
    
    var util = require('util'),
        winston = require('winston');
    
    Logger.defaultLevel = 'warn';

    function Logger(opts) {
        opts = opts || { };
        
		var tag = this.tag = opts.tag || 'Logger';
        
        this.name = 'screenLogger';
		this.level = process.env['DEBUG_'+tag.replace(/\S+/g, '').toUpperCase()] ||
                     opts.level || process.env.DEBUG_ALL || Logger.defaultLevel;


		this.newline = false;
    };
    
    util.inherits(Logger, winston.Transport);
    winston.transports.ScreenLogger = Logger;

	var lastday = null,
		lasttime = null;

	var GREEN = '\x1B[1;32m',
		green = '\x1B[32m',
		cyan  = '\x1B[36m',
		yellow= '\x1B[33m',
		RED   = '\x1B[1;31m',
		WHITE = '\x1B[1;37m',
		reset = '\x1B[0m';

	var inspect = (function () {
		if (typeof phantom !== 'undefined') return function (obj) { return obj; }
		if (typeof module !== 'undefined') return require('util').inspect;
	})();

	Logger.prototype.log = function (type, msg, meta, callback) {
        if (!msg && meta) { msg = meta; }
        var name = this.tag;
        
		var out = '',
			now = new Date(),
			day =
				now.getFullYear() + '.' +
				(now.getMonth()+1) + '.' + 
				now.getDate(),
			time =
				('0'+now.getHours()).slice(-2) + ':' +
				('0'+now.getMinutes()).slice(-2) +  '.' +
				('0'+now.getSeconds()).slice(-2);
		
		if (this.newline) {
			out = '\n';
			this.newline = false;
		}
		
		if (day != lastday) {
			lastday = day;
			console.log(GREEN + '---' + day + '---' + reset);
		}
		if (time != lasttime) {
			lasttime = time;
			out += time + ' ';
		} else {
			out += '         ';
		}
		var newLine = '\n             ';
        
		if (!Array.isArray(msg)) { msg = [msg]; }
		msg.forEach(function (val, idx, arr) {
			if (val instanceof Error) {
				arr[idx].logged = true;
                if (val.stack) { val = val.stack; }
                val = String(val);
			} else if (typeof val !== 'string') {
				val = inspect(val);
			} else {
				val = val.toString();
			}
			arr[idx] = val
				.split('\n')
				.join(newLine)
			;
		});
		msg = msg.join(newLine);

		switch (type) {
			case 'trace':
				console.log(GREEN + out + reset + WHITE + '[t] ' + name + ': ' + reset + msg);
				break;
			case 'silly':
				console.log(GREEN + out + reset + green + '[s] ' + name + ': ' + reset + msg);
				break;
			case 'info':
				console.log(GREEN + out + reset + cyan + '[i] ' + name + ': ' + reset + msg);
				break;
			case 'warn':
				console.log(GREEN + out + reset + yellow + '[w] ' + name + ': ' + reset + msg);
				break;
			case 'error':
				console.log(GREEN + out + reset + RED + '[e] ' + name + ': ' + reset + msg);
				break;
            default:
                console.log('unknown log type: ' + type);
                break;
		}
        callback();
	};
	
	return Logger;
})();
