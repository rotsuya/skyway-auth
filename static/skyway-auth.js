$('document').ready(function() {
    $('#get-btn').click(function() {
        var peerId = $('#peerId').val();
        $.post('./authenticate',
            {
                peerId: peerId
            }, function(credential) {
                $('#result').text(JSON.stringify(credential, null, 2));

                if (peerId.length === 0) {
                    var peer = new Peer({
                        key: $('#apikey').val(),
                        credential: credential
                    });
                } else {
                    var peer = new Peer(peerId, {
                        key: $('#apikey').val(),
                        credential: credential
                    });
                }

                peer.on('open', function() {
                    $('#result').text($('#result').text() + '\n' + 'peerId: ' + peer.id);
                    setTimeout(function() {
                        peer.disconnect();
                    }, 1000);
                });

                peer.on('error', function(e) {
                    console.error(e);
                    alert('Signaling server returned error');
                });
            }
        ).fail(function(e) {
            console.error(e);
            alert('Auth server returned error');
        });
    });
});
