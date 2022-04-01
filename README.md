# couch-users
## a simple angular app to manage users on a CouchDB server.
## add / edit / delete user, change a user password

This project was needed to manage CouchDB users where CouchDB is proxied locally. Running Fauxton in a subroute has been problematic and who wants to write JSON files for a bunch of users. Only email, phone, & notes fields have been added, but feel free to edit users.component.html & users.component.ts for more functionality

USAGE:

  clone the repo somewhere, create a new Angular application and then just copy the src into it.

  the app-conf.json file has just two properties:


    "couchProxyEndpoint": "couch_url:5984"  // or something like "couch/" to proxy

    "userRoles": [                                 // the database access-control roles for your apps
      {"idx": 0, "role": "role1"},
      {"idx": 1, "role": "role2"},
        .
        .
        .
      {"idx": x, "role": "roleX"},
    ]

You can't change server admin passwords, have to edit admins.ini and reload CouchDB.
CouchDB security only allows server admins to mess around with users and the app tests for this...

### Please feel free to use this app and modify it any way...
