import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from "@angular/common";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CouchDbService } from "./providers/couchdb-service";
import { GlobalDataService } from "./providers/global-data-service";
import { cloneDeep } from "lodash-es";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
}) export class AppComponent implements OnInit, AfterViewInit {
  title = 'couch-user';
  showPassword = false;
	loginError = '';
  @ViewChild('loginName') loginNameInput!: ElementRef;
  @ViewChild('loginBtn') loginBtn!: ElementRef;
  @ViewChild('logoutBtn') logoutBtn!: any;
	currentUser;
	disableAllEdits = true;
	currentEditButton;

  constructor(
		private db: CouchDbService,
    private http: HttpClient,
    public _loc: Location,
		public data: GlobalDataService
	) {}

	async ngOnInit() {
		console.log(`ngOnInit() fires...`);
    await this.data.loadConf();
	}

  async ngAfterViewInit() {
		console.log(`ngAfterViewInit() fires...`);
    // setTimeout(() => {
    //   this.loginNameInput.nativeElement.focus();
    // }, 1000);
	}

  //-- login...
	//
	async processLogin(btn) {
    console.log(`button: ${btn}`);
		switch (btn) {
			case 'userLogout':
				this.data.disableAllEdits = true;
				// this.data.isLoggedIn = false;
				this.data.showLogin = true;
        setTimeout(() => {
          this.logoutBtn.focus;
        }, 0);
				break;
			case 'login':
				try {
          await this.db.couchLogin(this.data.userLogin, this.data.userPassword).then(
						data => {
							console.log(`logged in: ${JSON.stringify(data)}`);
							this.data.userRoles = data.roles;
              if ((this.data.userRoles as string[]).includes('_admin')) {
                this.loginError = '';
                // this.data.userPassword = '';
              } else {
                throw('ERROR: You are not a server administrator...');
              }
						},
						err => {
							throw(`${err.status.toString()}: ${err.error.error.toUpperCase()} - ${err.error.reason}`);
						}
					);
          this.data.showLogin  = false;
					this.data.showDataLoading = true;

					await this.data.loadData();
          this.data.disableAllEdits = false;
          this.data.isLoggedIn = true;
          this.showPassword    = false;
					this.data.showDataLoading = false;
				} catch (error:any) {
					console.log(`login catch block: ${JSON.stringify(error.error)}`);
					this.loginError = error;
					this.data.showDataLoading = false;
					this.data.showLogin = true
				}
				break;
			case 'logout':
				await this.db.couchLogout().then(
					data => {
						console.log(`logged out: ${JSON.stringify(data)}`);
					},
					err => {
						console.log(`ERROR: ${JSON.stringify(err)}`);
					}
				);
				this.data.users 				= [];
				this.data.userLogin 		= '';
				this.data.userPassword	= '';
				this.data.userRoles 		= [];
				this.data.disableAllEdits 		= true;
				this.data.isLoggedIn 		= false;
        this.showPassword       = false;
				this.loginError					= '';
				break;
      case 'changePW':
        console.log('changing it...')
        try {
          if (this.data.oldPW === this.data.userPassword) {
            const updateRec = {}
            const currentLoggedInUser = await this.db.couchGetRecordByID('_users', 'org.couchdb.user:' + this.data.userLogin);
            console.log(currentLoggedInUser)
            const newUser = cloneDeep(currentLoggedInUser);
            newUser.password = this.data.newPW;
            delete newUser.password_scheme;
            delete newUser.iterations;
            delete newUser.salt;
            delete newUser.derived_key;
            console.log(newUser)

            // await this.http.put(this.db.db_url + '_users', newUser, {observe: 'body', responseType: 'json', withCredentials: true}).toPromise()
            await this.db.couchUpdateRecord('_users', newUser);

            this.data.oldPW = '';
            this.data.newPW = '';
            this.data.showChangePW 	= false;
          } else {
            throw(`ERROR: Your password does not match...!`);
          }
        } catch (error:any) {
					this.loginError = `ERROR: ${error.status} - ${error.error.error}`;
          console.log(`change password catch block: ${this.loginError}`);
        }

        break;
			case 'cancel':
				this.data.disableAllEdits    = false;
				this.data.isLoggedIn 	  = true;
        this.data.oldPW         = '';
        this.data.newPW         = '';
        this.data.showLogin     = false;
				this.data.showChangePW 	= false;
        this.showPassword       = false;
				break;
		}
	}

	// //-- edit control bar logic...
	// //
	// async handleEditControls(btn) {
	// 	switch (btn) {
	// 		case 'new':
  //     console.log(`adding user...`);
	// 		console.log(`JSON.stringify(data.currentUserSubmitBuf)`);
	// 					// this.data.savedMeterBuf = cloneDeep(this.data.currentMeterBuf);
	// 					// this.data.savedMeterIdx = this.data.currentMeterIdx;
	// 					// this.data.currentMeterBuf = new Meter;
	// 			this.data.editMode = true;
	// 			this.data.addOrEdit = 'add';
	// 			break;
  //
	// 		case 'edit':
	// 			console.log(`editing meter...`);
	// 					// this.data.savedMeterBuf = cloneDeep(this.data.currentMeterBuf);
	// 					// this.data.savedMeterIdx = this.data.currentMeterIdx;
	// 			this.data.editMode = true;
	// 			this.data.addOrEdit = 'edit';
	// 			break;
	// 		case 'delete':
	// 			this.data.editMode = false;
	// 			console.log(`delete...`)
	// 			break;
  //
	// 		case 'save':
	// 			console.log(`saving meter...`);
	// 					// this.data.currentInterfaceBuf.interface_name = this.data.currentInterfacePrefix + '-' + this.data.currentInterfaceNumber;
	// 					// try {
	// 					// 	const result = await this.db.couchUpdateRecord('meter-interfaces', this.data.currentInterfaceBuf);
	// 					// 	this.data.currentInterfaceBuf._rev = result.rev;
	// 					// 	if (this.data.addOrEdit === 'edit') {
	// 					// 		this.data.interfaces[this.data.currentInterfaceIdx] = cloneDeep(this.data.currentInterfaceBuf)
	// 					// 	} else {
	// 					// 		this.data.interfaces.push(this.data.currentInterfaceBuf);
	// 					// 	}
	// 					// 	this.data.interfaces.sort((a, b) => {
	// 					// 		return a.interface_name >= b.interface_name;
	// 					// 	});
	// 					// 	this.data.currentInterfaceIdx = this.data.getRecordArrayIdx(this.data.interfaces, 'interface_name', this.data.currentInterfaceBuf.interface_name);
	// 					// } catch (error) {
	// 					// 	console.log(`ERROR saving interface: ${JSON.stringify(error, undefined, 2)}`);
	// 					// }
	// 			this.data.editMode = false;
  //       this.data.addOrEdit = 'edit';
	// 			break;
	// 		case 'cancel':
	// 			console.log(`cancelling user edit...`);
  //       this.data.currentUserBuf = cloneDeep(this.data.users[this.data.currentUserIdx]);
	// 			this.data.editMode = false;
  //       this.data.addOrEdit = 'edit';
	// 			break;
	// 		case 'reload':
	// 			this.data.editMode = false;
	// 			console.log(`reload...`);
	// 			this.data.isDataLoaded = false;
	// 			this.data.showDataLoading = true;
	// 			await this.data.loadData();
	// 			this.data.showDataLoading = false;
	// 			break;
	// 	}
	// 	this.currentEditButton = btn;
	// }




}
