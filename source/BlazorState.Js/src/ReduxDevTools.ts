﻿import { BlazorState, BlazorStateName } from './BlazorState';

const ReduxExtentionName: string = '__REDUX_DEVTOOLS_EXTENSION__';
const DevToolsName: string = 'devTools';
export const ReduxDevToolsName: string = "reduxDevTools";

export class ReduxDevTools {
  IsEnabled: boolean;
  DevTools: any;
  Extension: any;
  Config: { name: string; features: { pause: boolean; lock: boolean; persist: boolean; export: boolean; import: boolean; jump: boolean; skip: boolean; reorder: boolean; dispatch: boolean; test: boolean; }; };
  BlazorState: BlazorState;

  constructor() {
    this.BlazorState = window[BlazorStateName]; // Depends on this functionality
    this.Config = {
      name: 'Blazor State',
      features: {
        pause: false, // start/pause recording of dispatched actions
        lock: false, // lock/unlock dispatching actions and side effects
        persist: false, // persist states on page reloading
        export: false, // export history of actions in a file
        import: false, // import history of actions from a file
        jump: true, // jump back and forth (time traveling)
        skip: false, // skip (cancel) actions
        reorder: false, // drag and drop actions in the history list
        dispatch: false, // dispatch custom actions or action creators
        test: false // generate tests for the selected actions
      }
    };
    this.Extension = this.GetExtension();
    this.DevTools = this.GetDevTools();
    this.IsEnabled = this.DevTools ? true : false;
    this.Init();
  }

  Init() {
    if (this.IsEnabled) {
      this.DevTools.subscribe(this.MessageHandler);
      window[DevToolsName] = this.DevTools;
    }
  }

  GetExtension() {
    const extension = window[ReduxExtentionName];
    //const extension = window.__REDUX_DEVTOOLS_EXTENSION__;

    if (!extension) {
      console.log('Redux DevTools are not installed.');
    }
    return extension;
  }

  GetDevTools() {
    const devTools = this.Extension && this.Extension.connect(this.Config);
    if (!devTools) {
      console.log('Unable to connect to Redux DevTools.');
    }
    return devTools;
  }
 
  MapRequestType(message) {
    var dispatchRequests = {
      'COMMIT': undefined,
      'IMPORT_STATE': undefined,
      'JUMP_TO_ACTION': 'BlazorState.Behaviors.ReduxDevTools.Features.JumpToState.JumpToStateRequest',
      'JUMP_TO_STATE': 'BlazorState.Behaviors.ReduxDevTools.Features.JumpToState.JumpToStateRequest',
      'RESET': undefined,
      'ROLLBACK': undefined,
      'TOGGLE_ACTION': undefined
    };
    var blazorRequestType;
    switch (message.type) {
      case 'START':
        blazorRequestType = 'BlazorState.Behaviors.ReduxDevTools.Features.Start.StartRequest';
        break;
      case 'STOP':
        //blazorRequestType = 'BlazorState.Behaviors.ReduxDevTools.Features.Stop.StopRequest';
        break;
      case 'DISPATCH':
        blazorRequestType = dispatchRequests[message.payload.type];
        break;
    }
    blazorRequestType &&
      console.log(`Redux Dev tools type: ${message.type} maps to ${blazorRequestType}`);

    return blazorRequestType;
  }

  MessageHandler(message) {
    console.log('ReduxDevTools.MessageHandler');
    console.log(message);
    var jsonRequest;
    const requestType = this.MapRequestType(message);
    if (requestType) { // If we don't map this type then there is nothing to dispatch just ignore.
      jsonRequest = {
        // TODO: make sure non Requests from assemblies other than BlazorState also work.
        //RequestType: 'BlazorState.Behaviors.DevTools.Features.Start.ReduxDevToolsStartRequest, BlazorState',
        //RequestType: 'BlazorState.Behaviors.DevTools.Features.Start.Request',
        RequestType: requestType,
        Payload: message
      };

      this.BlazorState.DispatchRequest(jsonRequest);
    } else
      console.log(`messages of this type are currently not supported`);
  }

  ReduxDevToolsDispatch(action, state) {
    if (action === 'init') {
      console.log("ReduxDevTools.js: Dispatching redux action: init");
      return window[DevToolsName].init(state);
    }
    else {
      console.log("ReduxDevTools.js: Dispatching redux action");
      console.log(action);
      return window[DevToolsName].send(action, state);
    }
  }

  //static Create() {
  //  console.log('js - ReduxDevTools.Create');
  //  const reduxDevTools = new ReduxDevTools();   
  //  return reduxDevTools.IsEnabled;
  //}
}