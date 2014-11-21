/*global
    Strophe: false,
    $pres: false,
    $msg: false,
    $iq: false,
    $build: false,
    msos: false
*/


Strophe.addConnectionPlugin(
    'muc',
    {
        _connection: null,
        _p_name: 'Strophe.Plugin.muc - ',

        init: function (conn) {
            "use strict";

            msos.console.debug(this._p_name + 'init -> start.');

            this._connection = conn;

            Strophe.addNamespace('MUC_OWNER', Strophe.NS.MUC + "#owner");
            Strophe.addNamespace('MUC_ADMIN', Strophe.NS.MUC + "#admin");

            msos.console.debug(this._p_name + 'init -> done!');
        },

        join: function (room, nick, msg_handler_cb, pres_handler_cb, password) {
            "use strict";

            msos.console.debug(this._p_name + 'join -> start.');

            var room_nick = this.test_append_nick(room, nick),
                msg,
                password_elem;

            msg = $pres(
                    {
                        from: this._connection.jid,
                        to: room_nick
                    }
                ).c("x", { xmlns: Strophe.NS.MUC });

            if (password) {
                password_elem = Strophe.xmlElement(
                    "password",
                    [],
                    password
                );
                msg.cnode(password_elem);
            }

            if (msg_handler_cb) {
                this._connection.addHandler(
                    function (stanza) {
                        var from = stanza.getAttribute('from'),
                            roomname = from.split("/");

                        // filter on room name
                        msos.console.debug(this._p_name + 'join -> done, msg callback.');

                        if (roomname[0] === room) { return msg_handler_cb(stanza); }
                        return true;
                    },
                    null,
                    "message",
                    null,
                    null,
                    null
                );
            }

            if (pres_handler_cb) {
                this._connection.addHandler(
                    function (stanza) {
                        var xquery = stanza.getElementsByTagName("x"),
                            i = 0,
                            xmlns;

                        if (xquery.length > 0) {
                            //Handle only MUC user protocol
                            for (i = 0; i < xquery.length; i += 1) {
                                xmlns = xquery[i].getAttribute("xmlns");

                                if (xmlns && xmlns.match(Strophe.NS.MUC)) {
                                    msos.console.debug(this._p_name + 'join -> done, pres callback.');
                                    return pres_handler_cb(stanza);
                                }
                            }
                        }
                        return true;
                    },
                    null,
                    "presence",
                    null,
                    null,
                    null
                );
            }

            this._connection.send(msg);

            msos.console.debug(this._p_name + 'join -> done!');
        },

        leave: function (room, nick, handler_cb) {
            "use strict";

            msos.console.debug(this._p_name + 'leave -> start.');

            var room_nick = this.test_append_nick(room, nick),
                presenceid = this._connection.getUniqueId(),
                presence = $pres(
                    {
                        type: "unavailable",
                        id: presenceid,
                        from: this._connection.jid,
                        to: room_nick
                    }
                ).c("x", { xmlns: Strophe.NS.MUC });

            this._connection.addHandler(
                handler_cb,
                null,
                "presence",
                null,
                presenceid,
                null
            );

            this._connection.send(presence);

            msos.console.debug(this._p_name + 'leave -> done!');
            return presenceid;
        },

        message: function (room, nick, message, type) {
            "use strict";

            msos.console.debug(this._p_name + 'message -> start.');

            var room_nick = this.test_append_nick(room, nick),
                msgid = this._connection.getUniqueId(),
                msg;

            type = type || "groupchat";

            msg = $msg(
                {
                    to: room_nick,
                    from: this._connection.jid,
                    type: type,
                    id: msgid}
            ).c("body", { xmlns: Strophe.NS.CLIENT }).t(message);

            msg.up().c("x", { xmlns: "jabber:x:event" }).c("composing");

            this._connection.send(msg);

            msos.console.debug(this._p_name + 'message -> done!');
            return msgid;
        },

        configure: function (room) {
            "use strict";

            msos.console.debug(this._p_name + 'configure -> called.');

            //send iq to start room configuration
            var config = $iq(
                    {
                        to: room,
                        type: "get"
                    }
                ).c("query", { xmlns: Strophe.NS.MUC_OWNER }),
                stanza = config.tree();

            return this._connection.sendIQ(
                stanza,
                function () {},
                function () {}
            );
        },

        cancelConfigure: function (room) {
            "use strict";

            msos.console.debug(this._p_name + 'cancelConfigure -> called.');

            //send iq to start room configuration
            var config = $iq(
                    {
                        to: room,
                        type: "set"
                    }
                ).c("query",    { xmlns: Strophe.NS.MUC_OWNER })
                 .c("x",        { xmlns: "jabber:x:data", type: "cancel" }
                ),
                stanza = config.tree();

            return this._connection.sendIQ(
                stanza,
                function () {},
                function () {}
            );
        },

        saveConfiguration: function (room, configarray) {
            "use strict";

            msos.console.debug(this._p_name + 'saveConfiguration -> called.');

            var config = $iq(
                    {
                        to: room,
                        type: "set"
                    }
                ).c("query",    { xmlns: Strophe.NS.MUC_OWNER })
                 .c("x",        { xmlns: "jabber:x:data", type: "submit" }),
                i = 0,
                stanza;

            for (i = 0; i < configarray.length; i += 1) {
                config.cnode(configarray[i]);
                config.up();
            }

            stanza = config.tree();

            return this._connection.sendIQ(
                stanza,
                function () {},
                function () {}
            );
        },

        createInstantRoom: function (room) {
            "use strict";

            msos.console.debug(this._p_name + 'createInstantRoom -> called.');

            var roomiq = $iq(
                    {
                        to: room,
                        type: "set"
                    }
                ).c("query",    { xmlns: Strophe.NS.MUC_OWNER })
                 .c("x",        { xmlns: "jabber:x:data", type: "submit" });

            return this._connection.sendIQ(
                roomiq.tree(),
                function () {},
                function () {}
            );
        },

        setTopic: function (room, topic) {
            "use strict";

            msos.console.debug(this._p_name + 'setTopic -> called.');

            var msg = $msg(
                    {
                        to: room,
                        from: this._connection.jid,
                        type: "groupchat"
                    }
                ).c("subject", { xmlns: "jabber:client" }).t(topic);

            this._connection.send(msg.tree());
        },

        modifyUser: function (room, nick, role, affiliation, reason) {
            "use strict";

            msos.console.debug(this._p_name + 'modifyUser -> called.');

            var item_attrs = { nick: Strophe.escapeNode(nick) },
                item,
                roomiq;

            if (role !== null) {
                item_attrs.role = role;
            }
            if (affiliation !== null) {
                item_attrs.affiliation = affiliation;
            }

            item = $build("item", item_attrs);

            if (reason !== null) {
                item.cnode(Strophe.xmlElement("reason", reason));
            }

            roomiq = $iq(
                    {
                        to: room,
                        type: "set"
                    }
                ).c("query", { xmlns: Strophe.NS.MUC_OWNER }).cnode(item.tree());

            return this._connection.sendIQ(
                roomiq.tree(),
                function () {},
                function () {}
            );
        },

        changeNick: function (room, user) {
            "use strict";

            msos.console.debug(this._p_name + 'changeNick -> called.');

            var room_nick = this.test_append_nick(room, user),
                presence = $pres(
                    {
                        from: this._connection.jid,
                        to: room_nick
                    }
                ).c("x", { xmlns: Strophe.NS.MUC });

            this._connection.send(presence.tree());
        },

        listRooms: function (server, handle_cb) {
            "use strict";

            msos.console.debug(this._p_name + 'listRooms -> called.');
            var iq = $iq(
                    {
                        to: server,
                        from: this._connection.jid,
                        type: "get"
                    }
                ).c("query", { xmlns: Strophe.NS.DISCO_ITEMS });

            this._connection.sendIQ(
                iq,
                handle_cb,
                function () {}
            );
        },

        test_append_nick: function (room, nick) {
            "use strict";

            var room_nick = room;

            msos.console.debug(this._p_name + 'test_append_nick -> called.');

            if (nick) {
                room_nick += "/" + Strophe.escapeNode(nick);
            }
            return room_nick;
        }
    }
);