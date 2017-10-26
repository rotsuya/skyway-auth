import EventEmitter from 'events';

class SkywayAuth extends EventEmitter {
    constructor(peerId) {
        super();

        var xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            try {
                if (xhr.readyState == 4 && xhr.status != 200) {
                    this.emit('error', xhr.responseText);
                }
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // What you want to do on success
                    this.emit('credential', JSON.parse(xhr.responseText));
                }
            } catch(err) {
                this.emit('error', err);
            }
        }, false);
        xhr.open('POST', './authenticate', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        if (peerId) {
            xhr.send('peerId=' + peerId);
        } else {
            xhr.send();
        }
    }
}

export default SkywayAuth;
