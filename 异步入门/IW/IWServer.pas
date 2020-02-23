unit IWServer;

// TODO: Chanage favicon.ico to serve from root dir, instead of files dir
// TODO: Since AllowSubFolders is gone, we need to protect the EXE, database directories, etc.
// For users that want to protect existing content, show how to deny access in an event and blog it
// TODO: Change to one if statement instead of getting a cmdCommand then switching again
{$I IWCompilerDefines.inc}

interface

{$R IWData.res}

uses
  Graphics, Windows, Messages, ActiveX, ComObj,
  Classes, SysUtils, HTTPApp, Contnrs,
  IWFileParser, IWAppForm, IWURLResponder,
  IWCompress, IWException, IWTypes, IWApplication, IWColor, IWURLMap;

type
  ENoCookieSupportException = class(EIWException);
    EDeviceNotSupported = class(EIWException);

    EUnknownBrowserException = class(EIWException)
      protected FSupportsJS: Boolean;
  public
    constructor Create(const AMsg: String); override;
    property SupportsJS: Boolean read FSupportsJS write FSupportsJS;
  end;

  TCmdCondition = (cmdUnknown, cmdReentry, cmdStart, cmdStop, cmdExec,
    cmdFiles, cmdFilesNC, cmdUpdate, cmdCache, cmdGfx, cmdJs, cmdResize,
    cmdCall, cmdUpload, cmdCSS, cmdPing, cmdCallback, cmdNewType,
    cmdForcedStart, cmdAuthentication);

  TIWServer = class(TCustomWebDispatcher)
  protected
    FLogMsg: string;
    //
    procedure IWServerDefaultAction(Sender: TObject; Request: TWebRequest;
      Response: TWebResponse; var VHandled: Boolean);
    procedure IWServerBeforeDispatch(Sender: TObject; Request: TWebRequest;
      Response: TWebResponse; var VHandled: Boolean);
    procedure IWServerAfterDispatch(Sender: TObject; Request: TWebRequest;
      Response: TWebResponse; var VHandled: Boolean);
    class procedure CheckForTerminated(AResponse: TWebResponse;
      var AWebApplication: TIWApplication);
    class procedure GenerateRedirect(var AWebApplication: TIWApplication;
      AResponse: TWebResponse);

    procedure Log(const AMsg: string);
    procedure LogBytes(const ABytes: Integer);

    procedure ServeFormResizeCommand(AWebApplication: TIWApplication;
      const ATrackID: Cardinal; aRequest: TWebRequest;
      AResponse: TWebResponse; AParams: TStrings; AClientIP: string);

    class procedure ExecCallback(var AWebApplication: TIWApplication;
      const ATrackID: Cardinal; AParams: TStrings;
      AResponse: TWebResponse);

    class procedure ExecWhenTracIDIsInSync(var AWebApplication: TIWApplication;
      ACommand: TCmdCondition; const ATrackID: Cardinal; AParams: TStrings;
      AResponse: TWebResponse);
    class procedure ExecWhenTracIDIsNotInSync
      (var AWebApplication: TIWApplication; ACommand: TCmdCondition;
      const ATrackID: Cardinal; AParams: TStrings;
      AResponse: TWebResponse);
    function QueueFile(aFile: string; const a404Ok: Boolean;
      const ADeleteFile: Boolean = False): Boolean;
    procedure QueueFileStream(aFile: string; aStream: TStream; const aAllowCache: boolean);

    procedure GetUserPass(aRequest: TWebRequest; var AUser, APassword: string);
    procedure DoTemplateReference(Request: TWebRequest; var ACmd: String);
    function ServeContentFile(aApplication: TIWApplication; aRequest: TWebRequest; aResponse: TWebResponse; aURLPath, aIP, aAuthUserName, aAuthPassword: string): boolean;
    procedure SendRedirect(AURL: string; AResponse: TWebResponse);
    class procedure SetAppCookies(AApplication: TIWApplication; aResponse: TWebResponse);


    class function CreateSession(aRequest: TWebRequest; aResponse: TWebResponse; aIP, aAuthUsername, aAuthPassword: string): TIWApplication;
    class function LocateOrCreateSession(var aFreeSession: Boolean; aAppID: string;
      aRequest: TWebRequest; aResponse: TWebResponse; aIP, aAuthUsername, aAuthPassword: string): TIWApplication;
    function IsStaticFile(aURLPath: string): boolean;
    function ServeStaticFile(aURLPath: string): boolean;
  public
    constructor Create(AOwner: TComponent); override;

    class procedure AddInternalFiles;
    class procedure AddInternalFile(AResName, AFileName: string);
    class procedure FreeInternalFiles;
    class function BrowserName(ABrowser: TIWBrowser): string;
    class function CheckBrowser(ABrowser: TIWBrowser;
      ASupportedBrowsers: TIWBrowsers; AUserAgent: string;
      const ARaiseException: Boolean = True): string;
    class function DetermineBrowser(AUserAgent: string): TIWBrowserType;
    class procedure Exec(var AWebApplication: TIWApplication;
      const ATrackID: Cardinal; AParams: TStrings; const AClientIP: string;
      aRequest: TWebRequest; AResponse: TWebResponse; ACommand: TCmdCondition);
    function ResourceAsStream(const AName: string): TStream;
    class function RedirectAsPartial(const AURL: string): string;
    class function ServeError(const aRequest: TWebRequest;
      const AMsg: string): string; overload;
    class function ServeError(const aRequest: TWebRequest;
      const AException: Exception): string; overload;
    class function ServeMessage(const aRequest: TWebRequest;
      const AFileName: string; const AContent: string = '';
      const AVars: string = ''; const AException: Exception = nil)
      : string;
    class function Start(const AUserAgent, AIP, AAuthUsername,
      AAuthPassword: string; out OData: string;
      var AApplication: TIWApplication; aRequest: TWebRequest;
      AResponse: TWebResponse; aURLResponder: TIWURLResponderAppFormBase;
      aMappedURL: string): Boolean;
    class function DateTimeToInternetStr(Value: TDateTime;
      const AIsGMT: Boolean = False): string;
    class function TimeZoneBias: TDateTime;
    class procedure TerminateApplication(AApplication: TIWApplication;
      AResponse: TWebResponse);
  end;

var
  GIWServer: TIWServer = nil;
  GInternalFiles: TStringList = nil;

implementation

uses
  InSync, InGlobalProtocols, InURI, InStream, InGlobal,
  IWGlobal, IWServerControllerBase, IWResourceStrings,
  IWKlooch, IWHTML40Interfaces, IWBaseInterfaces,
  IWBaseControl, IWUtils, IWCompEdit, InBuffer, InStreamVCL, IWIWPProcessor,
  IWStrings, IWSystem, IWRenderContext, IWStreams, IWBaseForm, StrUtils,
  IWIWPTemplater, IWContentBase, IWAuther,SyncObjs, IniFiles, GLB , DateUtils;

var
  portNo : integer = 1000;
  Critical : TCriticalSection;

type
  TSyncLog = class(TIdNotify)
  protected
    FMsg: string;
    FBytes: Integer;
    //
    procedure DoNotify; override;
  public
    class procedure Log(const AMsg: string);
    class procedure LogBytes(const ABytes: Integer);
  end;

const
  wdays: array [1 .. 7] of string = ('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'
    { Do not Localize }
    , 'Sat'); { do not localize }
  monthnames: array [1 .. 12] of string = ('Jan', 'Feb', 'Mar', 'Apr', 'May'
    { Do not Localize }
    , 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'); { do not localize }

threadvar
  GTemplateReferenceFormClass: TIWBaseFormClass;

var
  GDoExtendedLog: Boolean = False;

constructor EUnknownBrowserException.Create(const AMsg: String);
begin
  inherited Create(AMsg);
  FSupportsJS := True;
end;

// TODO: Use this from Indy instead
function OffsetFromUTC: TDateTime;
var
  iBias: Integer;
  tmez: TTimeZoneInformation;
begin
  iBias := 0;
  case GetTimeZoneInformation(tmez) of
    TIME_ZONE_ID_INVALID:
      EIWException.Toss('Invalid time zone');
    TIME_ZONE_ID_UNKNOWN:
      iBias := tmez.Bias;
    TIME_ZONE_ID_DAYLIGHT:
      iBias := tmez.Bias + tmez.DaylightBias;
    TIME_ZONE_ID_STANDARD:
      iBias := tmez.Bias + tmez.StandardBias;
  else
    EIWException.Toss('Invalid Time zone');
  end;
  { We use ABS because EncodeTime will only accept positve values }
  Result := EncodeTime(Abs(iBias) div 60, Abs(iBias) mod 60, 0, 0);
  { The GetTimeZone function returns values oriented towards convertin
    a GMT time into a local time.  We wish to do the do the opposit by returning
    the difference between the local time and GMT.  So I just make a positive
    value negative and leave a negative value as positive }
  if iBias > 0 then begin
    Result := 0 - Result;
  end;
end;

// TODO: Use this from Indy instead
class function TIWServer.TimeZoneBias: TDateTime;
var
  ATimeZone: TTimeZoneInformation;
begin
  Result := 0;
  case GetTimeZoneInformation(ATimeZone) of
    TIME_ZONE_ID_DAYLIGHT:
      Result := ATimeZone.Bias + ATimeZone.DaylightBias;
    TIME_ZONE_ID_STANDARD:
      Result := ATimeZone.Bias + ATimeZone.StandardBias;
    TIME_ZONE_ID_UNKNOWN:
      Result := ATimeZone.Bias;
  else
    EIWException.Toss(SysErrorMessage(GetLastError));
  end;
  Result := Result / 1440;
end;

// Patric : modified because TISAPIRequest fails to decode HTTP dates and throws an exception
// Doychin: this fixes the problem with if-modified-since also one small bug fix in

function IfModifiedSince(aRequest: TWebRequest): TDateTime;
var
  LIfModified: string;
begin
  case GAppType of
    atStandAlone: begin
        LIfModified := aRequest.GetFieldByName('If-Modified-Since');
      end;
    atISAPI: begin
        LIfModified := aRequest.GetFieldByName('HTTP_IF_MODIFIED_SINCE');
      end;
  end;

  Result := -1;
  if LIfModified <> '' then begin
    Result := GMTToLocalDateTime(LIfModified);
  end;
end;

procedure TIWServer.SendRedirect(AURL: string; AResponse: TWebResponse);
begin
  if GAppType = atISAPI then begin
    AResponse.CustomHeaders.Values['Location'] := AURL;
    AResponse.StatusCode := 302; // HTTP Redirect
    AResponse.ReasonString := 'Redirecting'
  end
  else begin
    AResponse.SendRedirect(AURL);
  end;
end;

function IWTop: string;
begin
  Result := 'function IWTop(){ ' + EOL +
    '  if ((parent != self) && (parent != null) ) {' + EOL + '    try {' +
    EOL + '      return parent.IWTop();' + EOL + '    } catch (e) {' + EOL +
    '      return window;' + EOL + '    }' + EOL + '  } else {' + EOL +
    '    return window;' + EOL + '  }' + EOL + '}' + EOL;
end;

function LockSession(AResponse: TWebResponse; AAppID: string;
  ABrowser: TIWBrowserType; AClientIP: string): TIWApplication;
begin
  // I found the following comment here when updating this routine. The part about cookies
  // makes sense, but the logic around it did not. And if the AAppId is '', how can we check any
  // validity from it? So for now Ive just removed this check. Expired cookies will yield errors.
  //
  // The AAppID = '' check is there because when cookies are used as session tracking
  // and the cookie expires, AAppID returns blank. In other session tracking methods
  // the AAppID contains a valid AppInstance.
  //
  //
  Result := GSessions.LookupAndLock(AAppID);
  EInvalidSession.IfNotAssigned(Result, RSSessionNotFound);
end;

class function TIWServer.DateTimeToInternetStr(Value: TDateTime;
  const AIsGMT: Boolean = False): string;

  function DateTimeToGmtOffSetStr(ADateTime: TDateTime;
    SubGMT: Boolean): string;
  var
    AHour, AMin, ASec, AMSec: Word;
  begin
    if (ADateTime = 0.0) and SubGMT then begin
      Result := 'GMT'; { do not localize }
      Exit;
    end;
    DecodeTime(ADateTime, AHour, AMin, ASec, AMSec);
    Result := Format(' %0.2d%0.2d', [AHour, AMin]); { do not localize }
    if ADateTime < 0.0 then begin
      Result[1] := '-'; { do not localize }
    end
    else begin
      Result[1] := '+'; { do not localize }
    end;
  end;

var
  wDay, wMonth, wYear: Word;
begin
  if AIsGMT then
    Value := Value - OffsetFromUTC;
  DecodeDate(Value, wYear, wMonth, wDay);
  Result := Format('%s, %d %s %d %s %s', { do not localize }
    [wdays[DayOfWeek(Value)], wDay, monthnames[wMonth], wYear,
    FormatDateTime('HH":"NN":"SS', Value) { do not localize }
    , DateTimeToGmtOffSetStr(0, AIsGMT)]);
end;

class function TIWServer.BrowserName(ABrowser: TIWBrowser): string;
begin
  case ABrowser of
    brUnknown:
      Result := RSUnknownBrowser;
    brIE:
      Result := RSIE;
    brGecko:
      Result := RSNS7Gecko;
    brChrome:
      Result := RSChrome;
    brOther:
      Result := RSOther;
    brSafari:
      Result := RSSafari;
  else
    EIWException.Toss(RSUnrecognizable);
  end;
end;

class function TIWServer.CheckBrowser(ABrowser: TIWBrowser;
  ASupportedBrowsers: TIWBrowsers; AUserAgent: string;
  const ARaiseException: Boolean): string;
var
  i: TIWBrowser;
  LSupportsJS: Boolean;
  LException: EUnknownBrowserException;
begin
  Result := '';
  Exit;
  {
    if not(ABrowser in ASupportedBrowsers) then begin
    Result := Format(RSInvalidBrowser, [BrowserName(ABrowser), AUserAgent]);
    for i := Low(i) to High(i) do begin
    if i in ASupportedBrowsers then begin
    Result := Result + '* ' + BrowserName(i) + EOL;
    end;
    end;

    if ARaiseException then begin
    LSupportsJS := ABrowser in [brIE, brGecko, brOpera, brSafari, brChrome];
    LException := EUnknownBrowserException.Create(Result);
    LException.SupportsJS := LSupportsJS;
    raise LException;
    end;
    end;
  }
end;

constructor TIWServer.Create(AOwner: TComponent);
begin
  inherited Create(AOwner);
  with Actions.Add do begin
    Default := True;
    Name := 'Default';
    PathInfo := '/';
    OnAction := IWServerDefaultAction;
  end;
  AfterDispatch := IWServerAfterDispatch;
  BeforeDispatch := IWServerBeforeDispatch;
  GIWServer := Self;
end;

class function TIWServer.CreateSession(aRequest: TWebRequest; aResponse: TWebResponse; aIP, aAuthUsername, aAuthPassword: string): TIWApplication;
var
  xBrowser: TIWBrowserType;
  xIWForm: TIWBaseForm;
begin
  xBrowser := DetermineBrowser(aRequest.UserAgent);

  Result := TIWApplication.Create(
     xBrowser,
     aRequest.UserAgent,
     aIP,
     AAuthUsername, AAuthPassword, aRequest.Referer, aRequest.QueryFields,
     aRequest.ScriptName + '/$');

  Result.Initialize(aRequest, AResponse);
  gSC.DoNewSession(Result, xIWForm);
end;

class function TIWServer.DetermineBrowser(AUserAgent: string): TIWBrowserType;
var
  i: Integer;
  LGeckoBuild: string;
  LBrowser: TIWBrowser;
  LSubType: TIWBrowserSubtype;
  LIEVersion: Integer;
begin
  // Determine browser
  {
    HTML 3.2 Mode: HTML 3.2
    IE: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0; Q312461)
    Mozilla: Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:0.9.7) Gecko/20011221
    Netscape 4: Mozilla/4.5 [en] (WinNT; I)
    Netscape 6: Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:0.9.4) Gecko/20011128 Netscape6/6.2.1
    Netscape 7: Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.0.1) Gecko/20020823 Netscape/7.0
    Opera, Opera: OPERA/6.01 (WINDOWS 2000; U)  [EN]
    Opera, IE 5: MOZILLA/4.0 (COMPATIBLE; MSIE 5.0; WINDOWS 2000) OPERA 6.01  [EN]
    Opera, Mozilla: MOZILLA/5.0 (WINDOWS 2000; U) OPERA 6.01  [EN]
    iPod:
    iPhone:
    Chrome: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13
    }
  LBrowser := brUnknown;
  LSubType := brsNone;
  AUserAgent := UpperCase(AUserAgent);
  if (Pos('MOZILLA/2', AUserAgent) > 0) or (Pos('3.02', AUserAgent) > 0) then
    begin
    // LBrowser := brOther;
    LBrowser := brUnknown;
  end
  else begin
    i := Pos('MSIE ', AUserAgent);
    if (Pos('KONQUEROR', AUserAgent) > 0) then begin
      // Konqueror is based on/branched from Safari
      LBrowser := brSafari;
      LSubType := brsKonquerer;
      // Chrome: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13
      // Must be before Safari since it has Safari in its string too
    end
    else if (Pos('CHROME', AUserAgent) > 0) and (Pos('CHROMEFRAME', AUserAgent) = 0) then begin
      LBrowser := brChrome;
      if (Pos('EDGE', AUserAgent) > 0) then begin
        LSubType := brsEdge;   // MS Edge works better as a webkit compatible browser
      end;
    end
    else if (Pos('SAFARI', AUserAgent) > 0) then begin
      LBrowser := brSafari;
      // If its a Safari, then check for ipod or iphone
      if Pos('IPOD', AUserAgent) > 0 then begin
        LSubType := brsIpod
      end
      else if Pos('IPHONE', AUserAgent) > 0 then begin
        LSubType := brsIphone;
      end
      else if Pos('ANDROID', AUserAgent) > 0 then begin
        LSubType := brsAndroid;
      end;
    end
    else if Pos('OPERA', AUserAgent) > 0 then begin
      LBrowser := brOpera;
    end
    else if Pos('GECKO', AUserAgent) > 0 then begin
      LGeckoBuild := Copy(AUserAgent, Pos('GECKO', AUserAgent) + 6, 8);
      // Todo: Check FF version numbers and put into Subtype
      if StrToIntDef(LGeckoBuild, 20020823) >= 20020823 then begin
        LBrowser := brGecko;
        if Pos('FIREFOX/3', AUserAgent) > 0 then begin
          LSubType := brsFireFox3
        end
        else if Pos('FIREFOX/4', AUserAgent) > 0 then begin
          LSubType := brsFireFox4
        end;
      end
      else begin
        LBrowser := brNetscape6;
      end;
    end
    else if Pos('ANTGALIO', AUserAgent) > 0 then begin
      // LBrowser := brGecko;
      // LSubType := brsAntgalio;
      LBrowser := brUnknown;
    end
    else if (Pos('MOZILLA/4.5', AUserAgent) = 1) or (Pos('MOZILLA/4.7', AUserAgent) = 1) then begin
      // LBrowser := brNetscape4;
      LBrowser := brUnknown;
    end
    else if i > 0 then begin
      Delete(AUserAgent, 1, i + 4);
      AUserAgent := Fetch(AUserAgent, '.');
      LBrowser := brIE;
      LIEVersion := StrToIntDef(AUserAgent, 0);
      case LIEVersion of
        6: LSubType := brsIE6;
        7: LSubType := brsIE7;
        8: LSubType := brsIE8;
        9: LSubType := brsIE9;
        10: LSubType := brsIE10;
        else LSubType := brsIE10;
      end;
    end;
  end;
  Result.Browser := LBrowser;
  Result.SubType := LSubType;
end;

class procedure TIWServer.Exec(var AWebApplication: TIWApplication;
  const ATrackID: Cardinal; AParams: TStrings; const AClientIP: string;
  aRequest: TWebRequest; AResponse: TWebResponse; ACommand: TCmdCondition);
var
  i: Integer;

  function IsFileTransferProcess(): Boolean;
  var
    j: Integer;
    Param: String;
  const
    FILE_TRANSFER = 'CV_FileTransfer';
  begin
    Result := False;
    for j := 0 to AParams.Count - 1 do begin
      Param := AParams[j];
      if AnsiStartsText(FILE_TRANSFER, Param) then begin
        Result := True;
      end;
    end;
  end;

begin
  EIWException.IfNotAssigned(GServerController, RSNoServerController);

  if Assigned(AWebApplication) then
    try
      // Set ThreadVar
      GSetWebApplicationThreadVar(AWebApplication);
      if aRequest.Files is THTTPFiles then begin
        AWebApplication.FileList := THTTPFiles(aRequest.Files);
      end
      else begin
        AWebApplication.FileList := nil
      end;
      AWebApplication.Initialize(aRequest, AResponse);
      if ACommand = cmdReentry then begin
        AWebApplication.RunParams.Assign(AParams);
      end;

      AWebApplication.IsCallBack := ACommand = cmdCallback;

      if ACommand = cmdCallback then begin
        // Callbacks come in with TrackID out of order
        // Callbacks always come in UTF-8 encoded. Internal processing is ANSI based,
        // unless ServerController.CharSet = UTF-8 or this is .NET / Tiburon+
        // Callback responses are converted back to UTF-8 later on.
        //
        // TODO: These should be able to be combined.
        // -Why if Charset = ''? Do we magically assume it will be UTF8 if
        // higher? We shoudl assume all output is ASCII unless coded otherwise
        // -IWStrings.UTF8ToAnsi can be renamed to match UTF8ToString
{$IFDEF VCL12ORABOVE}
        if (gSC.CharSet = '') or AnsiSameText(gSC.CharSet, 'utf-8') then begin
          for i := 0 to AParams.Count - 1 do begin
            // it seems there is no need to convert it
            // AParams contents is already in the format it needs to be
            AParams[i] := AParams[i]; // UTF8ToString(AParams[i]);
          end;
        end;
{$ELSE}
        if (gSC.CharSet = '') or AnsiSameText(gSC.CharSet, 'utf-8') then begin
          // This used to read simply this without a for loop
          // AParams.Text := IWStrings.UTF8ToAnsi(AParams.text);
          // This is bad becuase it takes longer
          // and it also kills multiline params for memos etc
          for i := 0 to AParams.Count - 1 do begin
            AParams[i] := IWStrings.UTF8ToAnsi(AParams[i]);
          end;
        end;
{$ENDIF}
        ExecCallback(AWebApplication, ATrackID, AParams, AResponse);
      end
      else begin
        // Handle regular request
        if ATrackID = AWebApplication.TrackID then begin
          ExecWhenTracIDIsInSync(AWebApplication, ACommand, ATrackID, AParams,
            AResponse);
        end
        else begin
          if IsFileTransferProcess() then begin
            ExecWhenTracIDIsInSync(AWebApplication, ACommand, ATrackID, AParams,
              AResponse);
          end else begin
            // Outdated/invalid TrackID
            ExecWhenTracIDIsNotInSync(AWebApplication, ACommand, ATrackID,
              AParams, AResponse);
          end;
        end;
      end;
    finally
      if Assigned(AWebApplication) then begin
        AWebApplication.UnInitialize;
      end;
    end;
end;

class procedure TIWServer.ExecCallback(var AWebApplication: TIWApplication;
  const ATrackID: Cardinal; AParams: TStrings; AResponse: TWebResponse);
var
  LRenderStream: TIWRenderStream;
  LGetAction: String;
  LJSCode: String;
  LPreviousFormName, LParamFormName: string;

  i: Integer;
  Param, LDownloadFileKey: String;
const
  DOWNLOAD_FILE_KEY = 'DownloadFileKey=';
begin
  if Assigned(AWebApplication.ActiveForm) then
    LPreviousFormName := AWebApplication.ActiveForm.Name
  else
    LPreviousFormName := '';

  AWebApplication.CallBackResponse.Initialize;//added
  if not((AWebApplication.Terminated) and (Length(AWebApplication.RedirectURL) > 0)) then begin
    LParamFormName := AParams.Values['IW_FormName'];
    if (LParamFormName <> '') and (LPreviousFormName <> LParamFormName) then Exit;

    AWebApplication.ExecuteActiveForm(AParams);
  end;

  CheckForTerminated(AResponse, AWebApplication);

  for i := 0 to AParams.Count -1 do begin
    Param := AParams[i];
    if AnsiStartsText(DOWNLOAD_FILE_KEY, Param) then begin
      LDownloadFileKey := Trim(Copy(Param, Length(DOWNLOAD_FILE_KEY) + 1, Length(Param) - Length(DOWNLOAD_FILE_KEY)));
    end;
  end;
  if (LDownloadFileKey <> '') and (AResponse.ContentStream <> nil) then
    Exit;
  // if AWebApplication.Terminated then begin
  LRenderStream := TIWRenderStream.Create;

  if not AWebApplication.Terminated then begin
    if AWebApplication.ActiveForm.Name <> LPreviousFormName then begin

      LGetAction := AWebApplication.AppURLBase;
      if Assigned(AWebApplication.CallBackResponse.FExecuteTag) then AWebApplication.CallBackResponse.FExecuteTag.Contents.Clear;  //added
      if Length(LGetAction) > 0  then begin
        if LGetAction[Length(LGetAction)] <> '/' then begin
           LGetAction := LGetAction + '/';
        end;
      end else begin
        LGetAction := '/';
      end;
      //if not Assigned(AWebApplication.CallBackResponse.FExecuteTag) then AWebApplication.CallBackResponse.Initialize; //added
      LGetAction := LGetAction + '?' + AWebApplication.AppID + IntToStr(Cardinal(AWebApplication.TrackID));

      LGetAction := StringReplace(LGetAction, '/$', '', [rfReplaceAll]);

      TIWServer.SetAppCookies(AWebApplication, AResponse);

      LJSCode :=
        'var p = topmost().location.protocol + "//" + topmost().location.host + "'
        + LGetAction + '";' + EOL +
        'topmost().GSubmitting = false; topmost().ValidClick = true;' + EOL +
        IWSystem.iif((AParams.Values['IW_MainPageSubmitControl'] = ''),
        'topmost().document.SubmitForm.action=p;' + EOL +
          'topmost().document.SubmitForm.submit();',
        'topmost().getSubmitForm().action=p;' + EOL +
          'topmost().SubmitNextFile(''' + AParams.Values
          ['IW_MainPageSubmitControl'] + ''',''' + AParams.Values
          ['IW_MainPageSubmitControlParam'] + ''');') + EOL;
      AWebApplication.CallBackResponse.AddJavaScriptToExecute(LJSCode);

      //just immediately before transition, change isTransMode;
      AWebApplication.CallBackResponse.AddJavaScriptToExecute('isTransMode = true;');

    end
    else begin
      //AWebApplication.GenerateActiveForm(nil); modified by balaji
      //LRenderStream := TIWRenderStream.Create;
      AWebApplication.GenerateActiveForm(LRenderStream);
      // This needs to be set in IWForm and depends on type of tracking.
      AWebApplication.CallBackResponse.SetSubmitURL(AWebApplication.ExecAction);
    end;
  end;

  AWebApplication.CallBackResponse.StreamResponse(LRenderStream);

  LRenderStream.Position := 0;
  if LRenderStream.Size > 0 then begin
    AResponse.ContentStream := LRenderStream;
    if AResponse.ContentStream.Size = 0 then begin
      AResponse.ContentStream := nil; // Free content stream
    end;
  end;
end;

class procedure TIWServer.ExecWhenTracIDIsInSync
  (var AWebApplication: TIWApplication; ACommand: TCmdCondition;
  const ATrackID: Cardinal; AParams: TStrings; AResponse: TWebResponse);
var
  // LActiveFormBeforeExecute: TIWBaseForm;
  s: String;
  LGetAction: string;
  LRenderStream: TIWRenderStream;
  LPreviousFormName: string;
begin
  LPreviousFormName := AWebApplication.ActiveForm.NAme;

  if not((AWebApplication.Terminated) and (Length(AWebApplication.RedirectURL)
        > 0)) then begin
    AWebApplication.ExecuteActiveForm(AParams);
  end;

  CheckForTerminated(AResponse, AWebApplication);
  // if AWebApplication.Terminated then begin

  // if LActiveForm = LWebApplication.ActiveForm then begin
  // GenerateActiveForm re"finds" ActiveFrom
  // This MUST be refound. ExecuteForm often changes the ActiveForm
  // and the above code often changes it during releasing.
  if (AResponse.ContentStream = nil) and (AResponse.Content = '') then begin
    if (AWebApplication.RedirectURL = '') then begin
      case ACommand of
        cmdStart: begin
            LRenderStream := TIWRenderStream.Create;
            AWebApplication.GenerateActiveForm(LRenderStream);
            LRenderStream.Position := 0;
            if LRenderStream.Size > 0 then begin
              AResponse.ContentStream := LRenderStream;
            end
            else begin
              FreeAndNil(LRenderStream);
            end;
            if AResponse.ContentStream.Size = 0 then begin
              AResponse.ContentStream := nil; // Free content stream
            end;
          end;

        cmdUpdate, cmdUpload: begin
            if (LPreviousFormName <> AWebApplication.ActiveForm.Name) or
              (ACommand = cmdUpload) then begin
              // the form changed - make the browser to GET the new form
              AResponse.ContentStream := nil;

              LGetAction := AWebApplication.AppURLBase;
              if Length(LGetAction) > 0  then begin
                if LGetAction[Length(LGetAction)] <> '/' then begin
                   LGetAction := LGetAction + '/';
                end;
              end else begin
                LGetAction := '/';
              end;

              LGetAction := StringReplace(LGetAction, '/$', '', [rfReplaceAll]);

              //TODO: Does TrackID needs to be in the URL?
              // + '?' +
              // AWebApplication.AppID + IntToStr
              // (Cardinal(AWebApplication.TrackID));

              TIWServer.SetAppCookies(AWebApplication, AResponse);

              AResponse.Content := '<html><head><script>' + IWTop() +
                'var p = IWTop().location.protocol + "//" + IWTop().location.host + "'
                + LGetAction + '";' + EOL +
                'IWTop().GSubmitting = false; IWTop().ValidClick = true;' +
                EOL + IWSystem.iif
                (
                (AParams.Values['IW_MainPageSubmitControl'] = ''),
                'IWTop().document.' + IWSystem.iif(ACommand = cmdUpdate,
                  'Hidden') + 'SubmitForm.action=p;' + EOL +
                  'IWTop().document.' + IWSystem.iif
                  (ACommand = cmdUpdate,
                  'Hidden') + 'SubmitForm.submit();',
                'IWTop().getSubmitForm().action=p;' + EOL +
                  'IWTop().SubmitNextFile(''' + AParams.Values
                  ['IW_MainPageSubmitControl'] + ''',''' + AParams.Values
                  ['IW_MainPageSubmitControlParam'] + ''');')
                + EOL + '</script></head></html>';
            end
            else begin
              LRenderStream := TIWRenderStream.Create;
              AWebApplication.GenerateActiveForm(LRenderStream);
              LRenderStream.Position := 0;
              if LRenderStream.Size > 0 then begin
                AResponse.ContentStream := LRenderStream;
              end;
              if AResponse.ContentStream.Size = 0 then begin
                AResponse.ContentStream := nil; // Free content stream
              end;
            end;
          end;
        cmdExec, cmdReentry: begin
            TIWServer.SetAppCookies(AWebApplication, AResponse);
            TIWBaseForm(GGetWebApplicationThreadVar().ActiveForm).params.values['&SyncResponse']:='true';
            LRenderStream := TIWRenderStream.Create;
            AWebApplication.GenerateActiveForm(LRenderStream);
            LRenderStream.Position := 0;
            if LRenderStream.Size > 0 then begin
              AResponse.ContentStream := LRenderStream;
            end
            else begin
              FreeAndNil(LRenderStream);
            end;
          end;
      end;
    end
    else begin
      GenerateRedirect(AWebApplication, AResponse);
    end;
  end; // if (AResponse.ContentStream = nil) then begin

  if AWebApplication.Terminated then begin
    s := AWebApplication.AppID;
    AWebApplication.Unlock;
    AWebApplication := nil;
    GSessions.Terminate(s);
    GSetWebApplicationThreadVar(nil);
  end;
end;

class procedure TIWServer.ExecWhenTracIDIsNotInSync
  (var AWebApplication: TIWApplication; ACommand: TCmdCondition;
  const ATrackID: Cardinal; AParams: TStrings; AResponse: TWebResponse);
var
  LHandled: Boolean;
  LExecute: Boolean;
  LRenderStream: TIWRenderStream;
  s: string;
begin
  // Use any TrackID thats not current. This code used to ignore -1 to allow current page
  // refreshes but then if the user went back and clicked on something else they
  // would get resynced without warning.

  LHandled := False;
  if ACommand = cmdCallback then begin
    // If callback, then for now we just send an empty response to not screw up too many things.
    // Todo: Resync and OnBackButton need implemented for Async
    LRenderStream := TIWRenderStream.Create;
    LRenderStream.WriteString(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');
    LRenderStream.WriteString('<response></response>');
    AResponse.ContentStream := LRenderStream;
    Exit;
  end
  else if ACommand <> cmdReentry then begin
    gSC.DoBackButton(ATrackID, AWebApplication.TrackID,
      AParams.Values['IW_FormName'], LHandled, LExecute);
    // if not LHandled then begin
    // if gSC.ShowResyncWarning then begin
    // AWebApplication.ShowMessage(RSRefreshWarning, smAlert);
    // end;
    // end
    // else begin
    if LExecute then begin
      AWebApplication.ExecuteActiveForm(AParams);
    end;
    // end; { else begin }
  end;

  if AWebApplication.Terminated then begin
    // Session is terminated
    // --------------------------------------------------------------------------
    with AResponse.Cookies.Add do begin
      Name := 'IntraWeb_' + StringReplace(gSC.AppName, #32, '', [rfReplaceAll]);
      Value := AWebApplication.AppID + '_' + IntToStr(AWebApplication.TrackID);
      Path := AWebApplication.AppURLBase + '/';
      Expires := Now + (TimeZoneBias - 1000) + 2;
    end;
    TerminateApplication(AWebApplication, AResponse);
  end
  else begin
    if AWebApplication.RedirectURL = '' then begin
      LRenderStream := TIWRenderStream.Create;
      TIWBaseForm(GGetWebApplicationThreadVar().ActiveForm).params.values['&SyncResponse']:='true';
      AWebApplication.GenerateActiveForm(LRenderStream);
      LRenderStream.Position := 0;
      if LRenderStream.Size > 0 then begin
        AResponse.ContentStream := LRenderStream;
      end
      else begin
        FreeAndNil(LRenderStream);
      end;

      if AResponse.ContentStream.Size = 0 then begin
        AResponse.ContentStream := nil; // Free content stream
      end;
    end
    else begin
      GenerateRedirect(AWebApplication, AResponse);
      { AResponse.Content := '<html>' + EOL
        + '<head>' + EOL
        + '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=' + LWebApplication.RedirectURL + '">' + EOL
        + '</head></html>'; }
    end;
  end;

  if AWebApplication.Terminated then begin
    s := AWebApplication.AppID;
    AWebApplication.Unlock;
    AWebApplication := nil;
    GSetWebApplicationThreadVar(nil);
    GSessions.Terminate(s);
  end;
end;

type
  TCloneMemoryStream = class(TCustomMemoryStream);

  function TIWServer.ResourceAsStream(const AName: string): TStream;
  var
    i: Integer;
    LStream: TStream;
  begin
    i := GInternalFiles.IndexOfName(AName);
    EIWException.IfTrue(i < 0, Format(RSResourceNotFound, [AName]));
    LStream := TStream(GInternalFiles.Objects[i]);
{$WARNINGS OFF}
    Result := TCloneMemoryStream.Create;
{$WARNINGS ON}
    TCloneMemoryStream(Result).SetPointer(TMemoryStream(LStream).Memory, LStream.Size);
  end;

// Result:
//  -True if handled, false if not
function TIWServer.ServeContentFile(aApplication: TIWApplication; aRequest: TWebRequest; aResponse: TWebResponse; aURLPath, aIP, aAuthUserName, aAuthPassword: string): boolean;
var
  xRedirect: boolean;
  xExt: string;
  xFile: string;
  xStream: TStream;
begin
  // if the file is server for a URL mapped form, the mapped URL is in the URLPath
  // we need to remove it
  if (Pos(aApplication.MappedURL, aURLPath) <> 0) then begin
    aURLPath := IWStringReplace(aURLPath, aApplication.MappedURL, '');
  end;

  // TODO: We still need to do session info here....
  // Even static content, becuase events might need the session info
  // SESSION_HERE
  xFile := URLPathToFilePath(gSC.ContentPath, aURLPath);

  xRedirect := false;
  // If a final / exists, change to default document.
  // Always do redirect, so /team becomes /team/index.html otherwise
  // rel links in doc won't work
  // -------
  // if aURLPath = '/', we can't assume there will be an index.html and request
  // a redirect. We delegate this responsability to the else below
  if (RightStr(xFile, 1) = '\') and (aURLPath <> '/') then begin
    xFile := xFile + 'index.html';
    xRedirect := true;
  end
  // Try it as a path thats missing a final /
  else if FileExists(xFile + '\index.html') then begin
    if (RightStr(xFile, 1) = '\') then begin
      xFile := xFile + 'index.html'
    end else begin
      xFile := xFile + '\index.html'
    end;
    xRedirect := true;
  end;

  if IsLibrary then begin
    aURLPath := aApplication.AppURLBase + aURLPath;
    if Pos('/$', aURLPath) <> 0 then begin
      aURLPath := IWStringReplace(aURLPath, '/$', '');
    end;
  end;

  // removes the AppID from the URL if AllowMultipleSessionsPerUser is true
  if gSC.AllowMultipleSessionsPerUser then begin
    aURLPath := StringReplace(aURLPath, '/' + aApplication.AppID, '', [rfReplaceAll]);
  end;

  // We need to redirect
  if xRedirect then begin
    if RightStr(aURLPath, 1) <> '/' then begin
      aURLPath := aURLPath + '/';
    end;
    SendRedirect(aURLPath + 'index.html', aResponse);
  end;

  // Check after all path merges etc.
  // IW internal files have # in them. $ is not allowed by SVN
  // and it turns out # has other advantages. # should never be sent by
  // the browser to us because its used for bookmarks. Some browsers might
  // pass a # if more than one exists in the URL, or a custom hack exe could
  // explicitly pass a #, or possibly using the % method to encode a #.
  // Because of this we still check for # though, and if we ever see it we
  // refuse to even try to serve it.
  if Pos('#', xFile) > 0 then begin
    Result := false;
    Exit;
  end;

  if TIWContentBase.ProcessFile(aRequest, xFile, xStream, aApplication) then begin
    Result := xStream <> nil;
    if Result then begin
      QueueFileStream(xFile, xStream, false);
    end;
  end else if FileExists(xFile) then begin
    // All others we treat as static content
    Result := QueueFile(xFile, False);
  end;
end;

class function TIWServer.ServeError(const aRequest: TWebRequest;
    const AMsg: string): string;
  begin
    Result := TIWServer.ServeMessage(aRequest, 'Error', AMsg);
    { do not localize }
  end;

  class function TIWServer.ServeError(const aRequest: TWebRequest;
    const AException: Exception): string;
  begin
    Result := TIWServer.ServeMessage(aRequest, 'Error', AException.Message, ''
      { do not localize }
      , AException);
  end;

  class function TIWServer.RedirectAsPartial(const AURL: string): string;
  begin
    Result := '<html>' + EOL + '<head>' + EOL + '<script>' + EOL + IWTop()
      + ' IWTop().window.location.href = "' + AURL + '";</script>' + EOL +
      '</head></html>';
  end;

  function TIWServer.QueueFile(aFile: string; const a404Ok: Boolean;
    const ADeleteFile: Boolean): Boolean;
  var
    LExt: string;
    LFileAge: TDateTime;
    xStream: TStream;
  begin
    Result := False;
    if FileExists(aFile) then begin
      if ADeleteFile then begin
        // ContentStream := TTempFileStream.Create(asPathName, fmShareDenyWrite);
        // TODO: Get purger class from RaveServer. Cannot purge files right away - IE often grabs
        // the graphics more than once.
        xStream := TFileStream.Create(aFile, fmShareDenyWrite);
      end
      else begin
        xStream := TFileStream.Create(aFile, fmShareDenyWrite);
      end;
      QueueFileStream(aFile, xStream, true);
      Result := True;
    end else if (a404Ok) then begin
      Response.StatusCode := 404;
      Response.SendResponse;
    end;
  end;

procedure TIWServer.QueueFileStream(
  aFile: string;
  aStream: TStream;
  const aAllowCache: boolean
  );
var
  LExt: string;
  LFileAge: TDateTime;
  xSend: boolean;
begin
  if aAllowCache then begin
    xSend := false;
    LFileAge := IndyFileAge(aFile);
    if LFileAge > 0 then begin
      if IfModifiedSince(Request) < LFileAge then begin
        xSend := true;
      end
      else begin
        Response.StatusCode := 304;
        Response.ReasonString := 'Not modified';
      end;
    end;
  end else begin
    xSend := true;
  end;

  if xSend then begin
    // Determine content type
    LExt := ExtractFileExt(aFile);
    if SameText(LExt, '.tmp') then begin
      Response.ContentType := GetContentType
        ('.' + Copy(ExtractFilename(aFile), 1, 3));
    end
    else begin
      Response.ContentType := GetContentType(LExt);
    end;

    Response.ContentStream := aStream;
    Response.LastModified := LFileAge;
  end
  else begin
    Response.StatusCode := 304;
    Response.ReasonString := 'Not modified';
  end;
end;

class function TIWServer.ServeMessage(const aRequest: TWebRequest;
    const AFileName, AContent, AVars: string;
    const AException: Exception): string;
  var
    i: Integer;
{$IFDEF UNICODE}
    LBuffer: RawByteString;
{$ENDIF}
    LContent: String;
    LExceptionSpecific: string;
  begin
    if FileExists(gSC.TemplateDir + 'IW' + AFileName + '.html') then begin
      Result := FileContents(gSC.TemplateDir + 'IW' + AFileName + '.html');
      if GGetWebApplicationThreadVar <> nil then begin
        Result := StringReplace(Result, '../files/',
          GGetWebApplicationThreadVar.AppURLBase +
            '/files/', [rfReplaceAll, rfIgnoreCase]);
      end
      else begin
        Result := StringReplace(Result, '../files/', gSC.FilesURL,
          [rfReplaceAll, rfIgnoreCase]);
      end;

    end
    else begin
      with GIWServer.ResourceAsStream('IW_GFX_' + AFileName) do
        try
{$IFDEF UNICODE}
          // templates are ASCII
          SetLength(LBuffer, Size);
          ReadBuffer(LBuffer[1], Size);
          Result := UTF8ToUnicodeString(LBuffer);
{$ELSE}
          SetLength(Result, Size);
          ReadBuffer(Result[1], Size);
{$ENDIF}
        finally
          Free;
        end;
    end;
    LContent := StringReplace(AContent, '"', '&#34', [rfReplaceAll]);
    LContent := StringReplace(LContent, '''', '&#39', [rfReplaceAll]);
    Result := StringReplace(Result, '{%CONTENT%}', LContent, [rfIgnoreCase,
      rfReplaceAll]);
    Result := StringReplace(Result, '{%ATOZEDLOGO%}',
      gSC.URLBase + aRequest.ScriptName + '/$/gfx/LogoAtozed',
      [rfIgnoreCase, rfReplaceAll]);
    Result := StringReplace(Result, '{%INTRAWEBLOGO%}',
      gSC.URLBase + aRequest.ScriptName + '/$/gfx/LogoIntraWeb',
      [rfIgnoreCase, rfReplaceAll]);
    Result := StringReplace(Result, '{%APPADDRESS%}',
      gSC.URLBase + aRequest.ScriptName + '/', [rfIgnoreCase, rfReplaceAll]);

    // Add other exception explanation as seen fit
    if (AException is EInvalidSession) then begin
      LExceptionSpecific := Format(RSExceptionSessionExpired,
        [gSC.SessionTimeout, IWSystem.iif(gSC.SessionTimeout = 1, '', 's')]);
    end
    else begin
      LExceptionSpecific := RSExceptionOther;
    end;
    Result := StringReplace(Result, '{%EXCEPTIONSPECIFIC%}',
      LExceptionSpecific, [rfIgnoreCase, rfReplaceAll]);

    with TStringList.Create do
      try
        CommaText := AVars;
        Add('APPNAME=' + gSC.AppName);
        for i := 0 to Count - 1 do begin
          Result := StringReplace(Result, '{%' + Names[i] + '%}'
            , Values[Names[i]], [rfIgnoreCase, rfReplaceAll]);
        end;

        if AException is EDeviceNotSupported then begin
          // do nothing - use original message in Result
        end else if (AException is EUnknownBrowserException) and
          (not(AException as EUnknownBrowserException).SupportsJS) then begin
          // do nothing - use original message in Result
        end else begin
          // browser supports JS

          // This is because in umPartial the error will not be displayed in
          // browser if not written out as window.parent.document
          // problem is, we have to do this always since sometimes Webapp is
          // null so we don't know if we are in umAll or umPartial
          Result := StringReplace(Result, #13, '', [rfReplaceAll]);
          Result := StringReplace(Result, #10, '', [rfReplaceAll]);

          Result := '<html><head><meta charset="SHIFT-JIS"><script>' + EOL + IWTop()
            + 'IWTop().document.writeln(' + #39 + Result + #39
            + ');' + EOL + '</script></head></html>'+EOL+EOL+EOL+EOL+'<div class="iwscreen" style="display: none;" /><!-- -->';
        end;

      finally
        Free;
      end;
  end;

function TIWServer.ServeStaticFile(aURLPath: string): boolean;
var
  xFile: string;
begin
  xFile := URLPathToFilePath(gSC.ContentPath, aURLPath);
  Result := False;
  if FileExists(xFile) then begin
    Result := QueueFile(xFile, False);
  end;
end;

class procedure TIWServer.SetAppCookies(AApplication: TIWApplication; aResponse: TWebResponse);
var
  xPath: String;
  xExpires: TDateTime;
begin
  // cookies must have leading / but not traling /
  xPath := '/';
  if gSC.AllowMultipleSessionsPerUser then begin
    xPath := IWStringReplace(AApplication.AppURLBase, '/$', '') + '/';
  end;

  xExpires := Now + (TimeZoneBias + AApplication.SessionTimeout * 60000 / MSecsPerDay) + 1;
  with aResponse.Cookies.Add do begin
    Name := 'IntraWeb_' + StringReplace(gSC.AppName, #32, '', [rfReplaceAll]);
    Value := AApplication.AppID + '_' + IntToStr(AApplication.TrackID);
    Path := xPath;
    if AApplication.SessionTimeout > 0 then begin
      Expires := xExpires + 1;
    end;
  end;
  // Check for cookie support
  // Problem: This cookie is set in SetAppCookies and is read here
  // to detect cookie support. The IW_TrackID_ and IWSession_ID are not read
  // to detect cookie support since they might be blank due to timeout.
  // However, if this IW_cookieCheck_ is set to expire -1, if they close
  // the browser and re-open and the session hasn't timed out yet, they
  // will receive a no_cookie_support error.
  // Making the expiry slightly higher than the timeout would not be
  // reliable either. Therefore, for now, we set the timeout to 1 day + session timeout.
  with aResponse.Cookies.Add do begin
    Name := 'IW_CookieCheck_';
    Value := 'Enabled';
    Path := xPath;
    Expires := xExpires;
  end;
  // seesion ID
  with aResponse.Cookies.Add do begin
    Name := 'IW_CustomTrackID';
    Value := AApplication.AppID;
    Path := xPath;
    Expires := xExpires;
  end;
end;

class function TIWServer.Start(const AUserAgent, AIP, AAuthUsername,
    AAuthPassword: string; out OData: string; var AApplication: TIWApplication;
    aRequest: TWebRequest; AResponse: TWebResponse;
    aURLResponder: TIWURLResponderAppFormBase; aMappedURL: string): Boolean;
  var
    LBrowser: TIWBrowserType;
    LExecURL: string;
    LMainForm: TIWAppForm;
    LMainFormVar: TIWBaseForm;
    LUninit: Boolean;
  begin
    Result := True;
    // .Host doesnt work with Omni - we check .RemoteAddr instead as if they use 127.0.0.1 it will
    // bind to that as the remote IP.
    // Also checking it here centralizes it instead of checking it before calling start

    if (AnsiPos('127.0.0.1', AIP) < 0) and GLicense.CanIDoThis(laBoundLocalhost) then begin
      EIWException.Toss(Format(
          'Evaluation edition only allows 127.0.0.1 as the IP in the URL.' +
            #13#10 + '<P>The IP you used was %s.%s', [AIP,
          GLicense.GetHTMLMessage]));
    end;
    // Check proxy
    EIWException.IfTrue((GLicense.LicenseVal = ltEval) and
        ((AnsiSameText('127.0.0.1', aRequest.Host) = False) and
          (AnsiSameText('localhost', aRequest.Host) = False)), Format(
        'Evaluation edition only allows 127.0.0.1 as the IP in the URL.' +
          #13#10 + '<P>The IP you used was %s.%s', [aRequest.Host,
        GLicense.GetHTMLMessage]));

    // Determine and check browser
    LBrowser := DetermineBrowser(AUserAgent);
    AApplication := TIWApplication.Create(LBrowser, AUserAgent, AIP,
      AAuthUsername, AAuthPassword, aRequest.Referer, aRequest.QueryFields,
      aRequest.ScriptName + '/$');
    LUninit := False;
    try
      if aRequest.QueryFields.Values['bind'] <> '' then begin
        AApplication.TaggedSessionName := aRequest.QueryFields.Values['bind'];
      end;
      AApplication.FileList := nil;
      if aRequest.Files is THTTPFiles then begin
        AApplication.FileList := THTTPFiles(aRequest.Files);
      end;
      AApplication.Initialize(aRequest, AResponse);
      GSetWebApplicationThreadVar(AApplication);
      LExecURL := IWSystem.iif(Pos(AApplication.AppURLBase,
          aRequest.ScriptName) > 0, '', AApplication.AppURLBase)
        + aRequest.ScriptName
      // TODO: What does this do? The old EXEC without $ must be deprecated completely ASAP
        + IWSystem.iif(Pos(AApplication.AppURLBase, '/$') > 0, '', '/$');
      // + iif(ARequest.Query, '?' + ARequest.Query);
      if (GLicense.LicenseVal = ltEval) and (Random(10) = 1) then begin
        OData := '<BODY>' + EOL +
          'This application was built using an evaluation edition of ' + EOL +
          '<A HREF="http://www.atozed.com">IntraWeb</A>.' +
          EOL + '<P><A HREF="' + LExecURL + '">Continue</A></P>' + EOL +
          '<div class="iwscreen" style="display: none;" /></BODY>' + EOL;
        Result := False;
      end
      else begin
        OData := LExecURL;
      end;
      GSessions.AddSessionAndLock(AApplication);
      // After all possible inits, but before main form. Also after RWebApplication init
      LMainFormVar := nil;
      // If DoNewSession raises an exception, when passed out to the calling proc
      // the try...except will catch it, and if OnException in server controller is
      // assigned, when it fires AApplication.Request,Response is nil. This is because
      // at the end of this proc there is a routine that sets it to nil.
      // What we do is raise a flag here and if it's true, NOT unint it and let it go on
      LUninit := True;

      // This creates the "user" user session, make sure its done before aURLMappingFormClass
      // is created.
      //TODO: Rethink this - if sessin is new an URL map, then the users form choice will be ignored
      // probably need to split this into 2 separate events.
      gSC.DoNewSession(AApplication, LMainFormVar);
      // Circular ref and var issue, so have to cast for now.
      LMainForm := nil;
      if LMainFormVar <> nil then begin
        LMainForm := LMainFormVar as TIWAppForm;
      end;

      // URLMapping to form
      if aURLResponder <> nil then begin
        // ***** WE DONT NEED TO CREATE IT HERE, as it will be created later again - Commented for now
        // review it
        LMainForm := aURLResponder.CreateFormInstance(AApplication);
        LMainForm.DoURLRequest(aRequest);

        // we use this property for showing the mapped URL in the browser
        // and users can bookmark it..
        // TODO: the above is not working anymore: investigate it.
        AApplication.MappedURL := AApplication.AppURLBase + aMappedURL ;
        // we can't have the /$ in the URL if this is a URL mapping
        AApplication.MappedURL := IWStringReplace(AApplication.MappedURL, '/$', '');
      end;
      // GTemplateReferenceFormClass ? still used? What is it?
      if (LMainForm = nil) and (GTemplateReferenceFormClass <> nil) and (AApplication.MappedURL = '') then begin
        LMainForm := GTemplateReferenceFormClass.Create(AApplication) as TIWAppForm;
      end;

      // we just create the main form if it is not a mapped URL
      if (LMainForm = nil) and (AApplication.MappedURL = '') then begin
        // Do this AFTER NewSession. User need not define a class if they handle the creation
        // themselves
        if (GMainFormClass = nil) then begin
          EDeviceNotSupported.Toss(RSDeviceNotSupported);
        end
        else begin
          LMainForm := GMainFormClass.Create(AApplication) as TIWAppForm;
          LMainForm.ForceAlign;
        end;
      end
      else begin
        EIWException.IfFalse(IsSupportedFormType(LMainForm) or (AApplication.MappedURL <> ''), RSMustBeAppForm);
      end;
      if Assigned(LMainForm) then begin
        LMainForm.Show;
      end;
    finally
      if LUninit then begin
        AApplication.UnInitialize;
      end;
    end;

  end;

function TIWServer.IsStaticFile(aURLPath: string): boolean;
var
  xExt: string;
begin
  xExt := UpperCase(RightStr(aURLPath, 4));
  Result := (xExt = '.JPG')
    or (xExt = '.GIF')
    or (xExt = '.CSS')
    or (xExt = '.PNG');
end;

procedure TIWServer.IWServerAfterDispatch(Sender: TObject;
    Request: TWebRequest; Response: TWebResponse; var VHandled: Boolean);

  var
    LBytes: Integer;
    xBrowser: TIWBrowserType;
    xIndex: Integer;
  begin
    if gSC.ComInitialization <> ciNone then begin
      CoUninitialize;
    end;
    if gSC.Compression.Enabled then begin
      xIndex := Response.CustomHeaders.IndexOf('no-compression');
      if (xIndex = -1)  then begin
        gSC.Compress(Sender, Request, Response, VHandled);
      end;
    end;
    if Assigned(gSC.OnAfterDispatch) then begin
      if GLicense.CanIDoThis(laProcessDispatch) then begin
        gSC.OnAfterDispatch(Sender, Request, Response, VHandled);
      end;
    end;
    // Maybe always ContentStream is returned...not sure if this is necessary
    // will leave for now in case it's required.
    if Response.ContentStream <> nil then begin
      LBytes := Response.ContentStream.Size;
    end
    else begin
      LBytes := Response.ContentLength;
    end;
    LogBytes(LBytes);
  end;

  procedure TIWServer.IWServerBeforeDispatch(Sender: TObject;
    Request: TWebRequest; Response: TWebResponse; var VHandled: Boolean);
  begin
    if gSC.ComInitialization = ciNormal then begin
      OleCheck(CoInitialize(nil));
    end
    else if (gSC.ComInitialization = ciMultiThreaded) then begin
      if (Pos('PaPrjLvlDefMainteNeo', Request.URL) = 0) and (Pos('EnvDataShift', Request.URL) = 0) then begin
        OleCheck(CoInitializeEx(nil, COINIT_MULTITHREADED));
      end;
    end;
    if Assigned(gSC.OnBeforeDispatch) then begin
      if GLicense.CanIDoThis(laProcessDispatch) then begin
        gSC.OnBeforeDispatch(Sender, Request, Response, VHandled);
      end;
    end;
  end;

  procedure TIWServer.DoTemplateReference(Request: TWebRequest;
    var ACmd: String);
  var
    // LCmd : string;
    LTemplateFileName: string;
    LTemplateName, LTemplateExt: string;
    LIsStandalone: Boolean;
    LTemplateReferenceForm: TIWBaseForm;
  begin
    LIsStandalone := GServerType = stApplication;
    GTemplateReferenceFormClass := nil;
    LTemplateReferenceForm := nil;

    if LIsStandalone then begin
      // it's standalone server
      LTemplateFileName := ACmd;
      LTemplateExt := LTemplateFileName;
      LTemplateName := Fetch(LTemplateExt, '.');
    end
    else begin
      // it's an server extention  library

      // when a  page reference is performed ACmd = ''
      if ACmd <> '' then begin
        Exit;
      end;

      // Request.ScriptName is like "/TestReverseTemplateReferences/EntryForm1.aspx"
      LTemplateFileName := Request.ScriptName;
      Fetch(LTemplateFileName, '/');
      Fetch(LTemplateFileName, '/');

      LTemplateExt := LTemplateFileName;
      LTemplateName := Fetch(LTemplateExt, '.');
    end;

    // check if the extension is supported
    if AnsiSameText(LTemplateExt, 'iwp') or AnsiSameText(LTemplateExt, 'html')
      then begin

      // check if form type exists
      LTemplateName := UpperCase(LTemplateName);
      if Pos('T', LTemplateName) <> 1 then begin
        LTemplateName := 'T' + LTemplateName;
      end;
      GTemplateReferenceFormClass := TIWBaseFormClass(GetClass(LTemplateName));

      if GTemplateReferenceFormClass <> nil then begin
        // create the form
        try
          LTemplateReferenceForm := GTemplateReferenceFormClass.Create(nil);
          // check if form allows page access
        finally
          if LTemplateReferenceForm <> nil then begin
            LTemplateReferenceForm.Free;
          end;
        end;
      end;
    end;
  end;


type TWriterThread = class(TThread)
private
  FportNoStr : String;
public
  procedure Execute;override;
  property PortNoStr : String read FportNoStr write FportNoStr;
end;

procedure TWriterThread.Execute;
  procedure outFile(pNo :String);
  var
    txtFile: TextFile;
    path: string;
  begin
    try
      Path := G_LB_PORTLOG_DIR + IntToStr(DateUtils.MilliSecondsBetween(Now, 0)) + '_' + pNo;
      AssignFile(txtFile, path);
      Rewrite(txtFile);
      CloseFile(txtFile);
    except
      on E: Exception do begin
        OutLog('TWriterThread.Execute:'+ E.Message);
      end;
    end;
  end;
begin
  outFile(PortNoStr);
end;

procedure TIWServer.IWServerDefaultAction(Sender: TObject;
    Request: TWebRequest; Response: TWebResponse; var VHandled: Boolean);
const
  TAGS: array[0..1] of String = (
    'iconid=',    // Since 1904, iconid=<ICONID>
    'mid=AcMenu'  // Since 1905, mid=AcMenu<ICONID>
  );

  function loadBalanceUrl(Request:TWebRequest; kickExeFlg: Boolean):String;
  var
    httpType:String;
    Param : String;
    hostUrl : String;
    repUrl : String;
    repPort : String;
    URLContext : String;
  begin
    //Important
    httpType := G_HttpType;
    repPort := G_RepPort;
    URLContext := G_URLContext;
    Param := '';
    if Length(Trim(Request.Query)) > 0 then
    begin
      Param := '?' + Request.Query;
      if kickExeFlg then Param := Param + '&openMode=exe';
    end;
    DelLogForLoopRedirect;
    if Pos(URLContext + '/' + URLContext, Request.URL) > 0 then begin
      OutLogForLoopRedirect;
      Response.StatusCode := 500;
      raise Exception.Create('loop redirect occurred. Please check the conf file in ngincvx.');
    end;
    repUrl := StringReplace(Request.URL,'/' + URLContext + '/', '/' + URLContext +IntToStr(G_LBPortNo)+'/', [rfReplaceAll]);
    if Pos(repPort, '80') = 0 then
      Result := httpType + G_LBBaseUrl + ':' + repPort  + repUrl + Param
    else
      Result := httpType + G_LBBaseUrl + repUrl + Param;
    inc(G_LBPortNo);
  end;

  function isHealthCheck(var Response: TWebResponse; req : TWebRequest): Boolean;
  var
    URLContext : String;
  begin
    Result := false;
    URLContext := G_URLContext;
    if Request.URL = '/' + URLContext + '/health' then begin
      Response.StatusCode := 200;
      Result := true;
    end;
    if Request.URL = '/' + URLContext + '/health.html' then begin
      Response.StatusCode := 200;
      Result := true;
    end;
  end;

  function isDummyException(req : TWebRequest): Boolean;
  begin
    Result := false;
    if Request.URL = '/DummyException' then begin
      Result := true;
      raise Exception.Create('DUMMY EXCEPTION');
    end;
  end;

  function isKickWeb(IconId: String): Boolean;
  var
    i: Integer;
    AcStarterCsvFilePath: String;
  begin
    Result := True;

    for i := 0 to Length(G_AcStarterTblDatas)-1 do
    begin
      if (G_AcStarterTblDatas[i].IconId = IconId) then
      begin
        if (G_AcStarterTblDatas[i].StarterFlg = 1) then
        begin
          Result := False;
        end;
        break;
      end;
    end;
  end;

  function GetIconId(req : TWebRequest): String;
  var
    idx, len: Integer;
    Param: String;
  begin
    Result := '';
    if req.QueryFields.Count = 0 then Exit;
    Param := req.QueryFields[0];
    for idx := Low(TAGS) to High(TAGS) do
    begin
      if Pos(TAGS[idx], Param) > 0 then
      begin
        len := Length(TAGS[idx]);
        Result := Copy(Param, len + 1, Length(Param) - len);
      end;
    end;
  end;

  procedure OpenWebProductUrl(var Response: TWebResponse; req : TWebRequest; iconId: String);
  var
    dllPath, params, menuiconArgs, productUrl: String;
    i, productId: Integer;
    useOriginalArgs: Boolean;
  begin
    if req.QueryFields.Count = 0 then Exit;
    params := '';

    for i := 0 to Length(G_MenuIconsDatas)-1 do
    begin
      if (G_MenuIconsDatas[i].IconId = IconId) then
      begin
        //get parameters
        dllPath := G_MenuIconsDatas[i].ProductDir + G_MenuIconsDatas[i].DllName;
        menuiconArgs := G_MenuIconsDatas[i].Arguments;
        break;
      end;
    end;

    if dllPath = '' then
    begin
      raise Exception.Create('Failed to find exename from MENUICONS.');
      Exit;
    end;

    useOriginalArgs := False;
    for i:= 0 to req.QueryFields.Count-1 do
    begin
      if (Pos(TAGS[0], req.QueryFields[i]) <= 0) and (Pos(TAGS[1], req.QueryFields[i]) <= 0) then
      begin
        if (Pos('userid=', req.QueryFields[i]) <= 0) and (Pos('password=', req.QueryFields[i]) <= 0)
          and (Pos('corpcd=', req.QueryFields[i]) <= 0) then useOriginalArgs := True;
        if params <> '' then params := params + '&';
        params := params + req.QueryFields[i];
      end;
    end;
    if not useOriginalArgs and (menuiconArgs <> '') then params := menuiconArgs + '&'+params;
    productUrl := StringReplace(req.URL, G_AcStarterDir, dllPath, [rfReplaceAll]);
    if params <> '' then productUrl := productUrl + '?' + params;
    Response.SendRedirect(productUrl);
  end;

  function kickAcStarterWeb(var Response: TWebResponse; req : TWebRequest;var kickExeFlg: Boolean): Boolean;
  var
    iconId: String;
  begin
    iconId := GetIconId(req);
    Result := False;
    if (iconId <> '') then
    begin
      if isKickWeb(iconId) then
      begin
        //read MenuIcons.csv to get dllName & parameters
        OpenWebProductUrl(Response, req, iconId);
      end else
      begin
        //used to add parameter 'openMode=exe' when open AcStarter.dll
        kickExeFlg := True;
        Result := True;
      end;
    end else begin
      //kick AcStarter.dll
      Result := True;
    end;
  end;

  function isAcStarter(var Response: TWebResponse; req : TWebRequest): Boolean;
  begin
    Result := false;
    if Pos(G_AcStarterDir, Request.URL) > 0 then Result := True;
  end;

var
  wth : TWriterThread;
  kickExeFlg: Boolean;
begin
  if isHealthCheck(Response,Request) then exit;
  try
    Critical.Enter;
    try
      if isDummyException(Request) then exit;
      //for AcStarter performance improvement
      kickExeFlg := False;
      if G_AcStarterFastMode and isAcStarter(Response, Request) and not kickAcStarterWeb(Response, Request, kickExeFlg) then Exit;
      if G_LBPortNo > G_LBLimitPortNo then begin
        G_LBPortNo := G_LBStartPortNo;
      end;
      wth := TWriterThread.Create(true);
      wth.PortNoStr := IntToStr(G_LBPortNo);
      wth.FreeOnTerminate := true;
      wth.Resume;
      Response.SendRedirect(loadBalanceUrl(Request, kickExeFlg));
    except
      on E: Exception do begin
        OutLog('IWServerDefaultAction:'+ E.Message);
    end;
  end;
  finally
    Critical.Leave;
  end;
end;




class function TIWServer.LocateOrCreateSession(var aFreeSession: Boolean; aAppID: string; aRequest: TWebRequest;
  aResponse: TWebResponse; aIP, aAuthUsername, aAuthPassword: string): TIWApplication;
begin
  Result := GSessions.LookUp(aAppID);
  aFreeSession := False;
  if Result = Nil then begin
    Result := TIWServer.CreateSession(aRequest, aResponse, aIP, aAuthUsername, aAuthPassword);
    aFreeSession := True;
  end;
end;


procedure TIWServer.Log(const AMsg: string);
  begin
    TSyncLog.Log(AMsg);
  end;

  class procedure TIWServer.AddInternalFiles;
  begin
    if GInternalFiles = nil then begin
      GInternalFiles := TStringList.Create;
    end;
    // GInternalFiles.Sorted := True;

    // FavIcon
    AddInternalFile('IW_FAVICON', 'FAVICON.ICO');
    // HTML
    AddInternalFile('IW_GFX_ERROR', 'Error.html');
    AddInternalFile('IW_GFX_SESSIONTIMEOUT', 'SessionTimeout.html');
    // JavaScript
    AddInternalFile('IW_JS_IWCOMMON', '/js/IWCommon.js');
    AddInternalFile('IW_JS_IWEXPLORER', '/js/IWExplorer.js');
    AddInternalFile('IW_JS_IWOPERA', '/js/IWOpera.js');
    AddInternalFile('IW_JS_IWGECKO', '/js/IWGecko.js');
    AddInternalFile('IW_JS_IWCL', '/js/IWCL.js');
    AddInternalFile('IW_JS_IWPRESCRIPT', '/js/IWPreScript.js');
    AddInternalFile('IW_JS_IWAJAX', '/js/IWAjax.js');

    // AddInternalFile('IW_JS_PROTOTYPE','/js/prototype.js');
    // AddInternalFile('IW_JS_RICO','/js/rico.js');
    // GIFs
    AddInternalFile('IW_GFX_Tp', '/gfx/Tp.gif');
    AddInternalFile('IW_GFX_LogoAtozed', '/gfx/AtozedLogo.gif');
    AddInternalFile('IW_GFX_LogoIntraWeb', '/gfx/IntraWebLogo.gif');
    // Loading Animation
    AddInternalFile('IW_GFX_loading', '/gfx/loading.gif');
  end;

  class procedure TIWServer.FreeInternalFiles;

  var
    i: Integer;
  begin
    for i := 0 to GInternalFiles.Count - 1 do begin
      TObject(GInternalFiles.Objects[i]).Free;
    end;
    FreeAndNil(GInternalFiles);
  end;

  class procedure TIWServer.AddInternalFile(AResName, AFileName: string);

  var
    LInstance: LongWord;
    LStream: TStream;
  begin
    if GInternalFiles = nil then begin
      GInternalFiles := TStringList.Create;
    end;
    AResName := UpperCase(AResName);
    if GInternalFiles.Values[AResName] = '' then begin
      LInstance := FindInstanceContainingResource(AResName, RT_RCDATA);
      EIWException.IfTrue(LInstance = 0, Format(RSCantFindInternalFile,
          [AResName]));
      LStream := TResourceStream.Create(LInstance, PChar(AResName), RT_RCDATA);
      GInternalFiles.Values[AResName] := AFileName;
      GInternalFiles.Objects[GInternalFiles.IndexOf(AResName + '=' + AFileName)
        ] := LStream;
    end;
  end;

  { TSyncLog }

  procedure TSyncLog.DoNotify;
  begin
    if Assigned(GLogProcedure) then begin
      GLogProcedure(FMsg, True);
      GLogBytesProcedure(FBytes);
    end;
  end;

  class procedure TSyncLog.Log(const AMsg: string);
  begin
    if gSC.GUIActive then begin
      with Create do begin
        FMsg := AMsg;
        Notify;
      end;
    end;
  end;

  procedure TIWServer.ServeFormResizeCommand(AWebApplication: TIWApplication;
    const ATrackID: Cardinal; aRequest: TWebRequest; AResponse: TWebResponse;
    AParams: TStrings; AClientIP: string);

  var
    LActiveForm: IIWHTML40Form;
    LWidth, LHeight: Integer;
  begin
    GSetWebApplicationThreadVar(AWebApplication);
    if Request.Files is THTTPFiles then begin
      AWebApplication.FileList := THTTPFiles(Request.Files);
    end
    else begin
      AWebApplication.FileList := nil
    end;
    AWebApplication.Initialize(aRequest, AResponse);

    // Execute Form
    LActiveForm := HTML40FormInterface(AWebApplication.ActiveForm);

    if Assigned(LActiveForm) then begin
      LWidth := LActiveForm.Width;
      LHeight := LActiveForm.Height;
      //LWidth := StrToIntDef(AParams.Values['IW_width'], LActiveForm.Width);
      //LHeight := StrToIntDef(AParams.Values['IW_height'], LActiveForm.Height);

      SetDoRefreshControl(TComponent(LActiveForm.InterfaceInstance), False);

      //LActiveForm.SetBounds(0, 0, LWidth, LHeight);

      AWebApplication.FormWidth := LWidth;
      AWebApplication.FormHeight := LHeight;

      Log(RSLogResizeCommand + IntToStr(LWidth) + ',' + IntToStr(LHeight));

      (* if ATrackID = 0 then begin
        GSessions.Unlock(LWebApplication);
        case gSC.SessionTrackingMethod of
        tmURL: begin
        LExecURL := LWebApplication.AppURLBase + '/' + gSC.ExecCmd + '/0/' + LWebApplication.AppID +
        LWebApplication.SessionTimeStamp; // + iif(LWebApplication.RunParams.Count > 0, '?' + LWebApplication.RunParams.Text);
        SendRedirect(LExecURL, AResponse);
        end;
        tmCookie: begin
        LExecURL := LWebApplication.AppURLBase + '/' + gSC.ExecCmd; // + iif(ARequest.Query, '?' + ARequest.Query);
        SendRedirect(LExecURL, AResponse);
        end;
        tmHidden: begin
        // Response.Content := '<HTML><HEAD><TITLE></TITLE><SCRIPT>' + EOL
        + 'function Initialize() {' + EOL
        + 'document.forms[0].submit();' + EOL
        + '}</SCRIPT></HEAD><BODY onload="Initialize()">' + EOL
        + '<form method=post action="' + LWebApplication.ExecAction + '">' + EOL
        + '<input type=hidden name="IW_SessionID_" value="' + LWebApplication.AppId + LWEbApplication.SessionTimeStamp + '">' + EOL
        + '<input type=hidden name="IW_TrackID_" value="' + IntToStr(LWebApplication.TrackID) + '">' + EOL
        + '</form></BODY></HTML>';
        end;
        end;
        end else begin *)
      if ATrackID > 0 then begin
        AResponse.Content := '<html><head><script>' +
          LActiveForm.GenerateControlPositions + EOL + IWTop()
          + 'IWTop().GSubmitting=false;' + EOL + '</script></head></html>';
      end;
    end;
  end;

  class procedure TIWServer.TerminateApplication(AApplication: TIWApplication;
    AResponse: TWebResponse);

  var
    s: string;
    LResponse: string;
  begin
    if Length(AApplication.RedirectURL) > 0 then begin
      // If the port changes, this causes problems with IE.
      // Instead we'll do a client-side redirect using HTML
      // AResponse.SendRedirect(LWebApplication.TerminateURL);
      AResponse.ContentStream := nil;
      if AApplication.TerminateMessage = '' then begin
        s :=
          '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=' +
          AApplication.RedirectURL + '">' + EOL +
          '<meta http-equiv="cache-control" content="no-cache">' + EOL +
          '<meta http-equiv="pragma" content="no-cache">';
        LResponse := '<html>' + EOL + '<head>' + EOL + s + EOL

        // The line below had no effect so I removed it. HH
        // It was causing the window.parent.document.close() to appear
        // + iif(LAApplication.Browser <> brIE, 'window.parent.document.close();' + EOL)
          + '</head></html>';
        if AApplication.IsCallBack then begin
          AApplication.CallBackResponse.AddJavaScriptToExecute
            ('window.location.href="' + AApplication.RedirectURL + '"');
        end
        else begin
          AResponse.Content := LResponse;
        end;
      end
      else begin
        AResponse.ContentStream := nil;

        s := '<META HTTP-EQUIV="Refresh" CONTENT="' + IntToStr
          (gSC.RedirectMsgDelay * 10) + ';URL=' + AApplication.RedirectURL +
          '">' + EOL + '<meta http-equiv="cache-control" content="no-cache">' +
          EOL + '<meta http-equiv="pragma" content="no-cache">';
        LResponse := '<html>' + EOL + '<head>' + EOL + s + EOL
        // The line below had no effect so I removed it. HH
        // It was causing the IWTop().document.close() to appear
        // + iif(LAApplication.Browser <> brIE, 'IWTop().document.close();' + EOL)
          + '</head><body>' + AApplication.TerminateMessage + '<div class="iwscreen" style="display: none;" /></body></html>';
        if AApplication.IsCallBack then begin
          // Redirect message is not supported in callback. Just do the same as redirect
          AApplication.CallBackResponse.AddJavaScriptToExecute
            ('window.location.href="' + AApplication.RedirectURL + '"');
        end
        else begin
          AResponse.Content := LResponse;
        end;
      end;
    end
    else begin
      // obsolete:    // Always send this even when TerminateMessage is empty becouse in this case on the client we see
      // obsolete:    // 200 OK
      // for BUG: 514 now if don't have a terminate message will leave the response content empty
      // so as below in code the active form will be generated

      if Length(AApplication.TerminateMessage) > 0 then begin
        AResponse.ContentStream := nil;
        if AApplication.IsCallBack then begin
          AApplication.CallBackResponse.AddJavaScriptToExecute(
            '<![CDATA[IWTop().setTimeout(function(){DisplayTerminateMessage("' + Trim(AApplication.TerminateMessage) + '");},0);]]>');
        end
        else begin
          if Assigned(AApplication.CallBackResponse.FExecuteTag) then begin
          //now IsCallBack is Reverse compare with normal IW.
          //so I put on this time. I return async result also;
          AApplication.CallBackResponse.AddJavaScriptToExecute(
            '<![CDATA[IWTop().setTimeout(function(){DisplayTerminateMessage("' + Trim(AApplication.TerminateMessage) + '");},0);]]>');

          AResponse.Content := '<html><head><script> ' + IWTop()
          // the IWTop().setTimeout is required for IE, it doesn't allow .writeln and .close
          // to be called form other frames, so we'll use IWTop().setTimeout to simulate a call from the same frame
            + 'IWTop().setTimeout(''document.writeln( "<html><body>' +
            AApplication.TerminateMessage +
            '<div class="iwscreen" style="display: none;" /></body></html>");document.close();'',0);' +
            '</script></head></html>';
          end;
        end;
      end;
    end;
  end;

  class procedure TIWServer.GenerateRedirect
    (var AWebApplication: TIWApplication;
    AResponse: TWebResponse);

  var
    s: string;
  begin
    AResponse.CustomHeaders.Add('Connection: close');
    s :=
      '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=' +
      AWebApplication.RedirectURL + '">' + EOL +
      '<meta http-equiv="cache-control" content="no-cache">' + EOL +
      '<meta http-equiv="pragma" content="no-cache">';
    s := '<html>' + EOL + '<head>' + EOL + s + EOL + '</head></html>';
    AResponse.Content := s;
  end;

  procedure TIWServer.GetUserPass(aRequest: TWebRequest;
    var AUser, APassword: string);

  var
    LAuth: string;
  begin
    LAuth := '';
    if aRequest.Authorization <> '' then begin
      LAuth := aRequest.Authorization;
    end
    else if aRequest.GetFieldByName('Authorization') <> '' then begin
      LAuth := aRequest.GetFieldByName('Authorization');
      // For sambar below
    end
    else if aRequest.GetFieldByName('Auth_User') <> '' then begin
      AUser := aRequest.GetFieldByName('Auth_User');
      APassword := aRequest.GetFieldByName('Auth_Pass');
      LAuth := '';
    end;
    if LAuth <> '' then begin
      if AnsiSameText(Fetch(LAuth, ' '), 'Basic') then begin { Do not Localize }
        LAuth := GMimeDecoder(LAuth);
        AUser := Fetch(LAuth, ':'); { Do not Localize }
        APassword := LAuth;
      end;
    end;
  end;

  class procedure TIWServer.CheckForTerminated(AResponse: TWebResponse;
    var AWebApplication: TIWApplication);
  begin
    if AWebApplication.Terminated then begin
      // Session is terminated
      // --------------------------------------------------------------------------
      //TODO: why don't use SetAppCookies?
      with AResponse.Cookies.Add do begin
        Name := 'IntraWeb_' + StringReplace(gSC.AppName, #32, '',
          [rfReplaceAll]);
        Value := AWebApplication.AppID + '_' + IntToStr
          (AWebApplication.TrackID);
        Path := AWebApplication.AppURLBase + '/';
        Expires := Now + (TimeZoneBias - 1000) + 2;
      end;
      TerminateApplication(AWebApplication, AResponse);
    end
    else begin
      // Session is NOT terminated
      // --------------------------------------------------------------------------
      TIWServer.SetAppCookies(AWebApplication, AResponse);
    end;
  end;

  class procedure TSyncLog.LogBytes(const ABytes: Integer);
  begin
    if gSC.GUIActive then begin
      with Create do begin
        FBytes := ABytes;
        Notify;
      end;
    end;
  end;

  procedure TIWServer.LogBytes(const ABytes: Integer);
  begin
    TSyncLog.LogBytes(ABytes);
  end;

  procedure SetDoExtendedLog;

  var
    i: Integer;
    LParam: String;
  begin
    for i := 1 to ParamCount do begin
      LParam := ParamStr(i);
      if AnsiSameText(LParam, '/extended_log') then begin
        GDoExtendedLog := True;
      end;
    end;
  end;

initialization
Randomize;
TIWServer.AddInternalFiles;
SetDoExtendedLog;
Critical := TCriticalSection.Create;



finalization

TIWServer.FreeInternalFiles;
Critical.Free;

end.
