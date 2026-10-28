[33m6de7e04[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m Added uiOnStatusChange event handler list to prog_load_ui module, and modified main_ui module to utilize it to change the status bar text.
[33m6adc5c6[m Removed import statements for MainUI from console_ui, canvas_ui, and debug_ui modules.
[33m3c8d1f1[m Removed switchEditorMode() function in editor_ui module and moved its code to the editorUI_onProgStart() and editorUI_onProgEnd() functions.
[33m1c657f7[m Removed uiOnMainResetHandlers from main_ui module and modified resetMain() to call the respective reset functions for each applicable module.
[33m15c8e8f[m Moved code from editorUI_onMainReset() to a new function, resetEditor(), in editor_ui module.
[33m5a660ac[m Finished moving the program loading code from the main modules to the prog_load  modules.
[33m2ce019e[m Modified all worker modules to use the program loading module.
[33mdf9f473[m In mediās rēs: Moving the program loading code from the main modules to the prog_load modules.
[33m95a6900[m Modified the dependency map to reflect the movement of program loading code from the main modules to the prog_load modules.
[33m09c0676[m Finished moving the thread messaging code from the main modules to the thread_msg modules.
[33m9e1485b[m In mediās rēs: Moving the thread messaging code from the main modules to the thread_msg modules.
[33m84c12e0[m Modified the dependency map to reflect the movement of thread messaging code from the main modules to the thread_msg modules.
[33m4d6e216[m Fixed typo in the file paths of thread_msg_worker and prog_load_worker module imports in main_worker module.
[33m1c3b73a[m Renamed the event-setting functions in all the worker modules to setEvents().
[33m189de04[m Moved all code for the about dialog from editor_ui module to about_ui module.
[33mfac955f[m Added prog_load_common module.
[33mef9fd11[m Renamed 'about' module to 'about_ui'.
[33mf835445[m Modified main_ui module to have separate style elements for each mountable element in the module.
[33m135c109[m Modified the mount functions in editor_ui, debug_ui, console_ui, and canvas_ui modules to give insertPosition parameter the default value of 'beforeend'.
[33m134481c[m  Modified canvas_ui module to have a seperate, pre-made style element for the canvasDiv element.
[33m7d88819[m Modified console_ui module to have a seperate, pre-made style element for the consoleDiv element.
[33m35e2850[m Modified editor_ui module to have a separate style elements for each mountable element in the module.
[33m6200b56[m Modified isDebugging flag to be an export of debug_ui module.
[33m106f709[m Moved debugToggleBtn element back to editor_ui module.
[33m483e638[m Added thread_msg and prog_load modules to dependency map file.
[33mf60f163[m Renamed 'editor' module back to 'edito_ui'.
[33mb748d98[m Removed file_ops module.
[33mf95afb4[m Modified the component-loading functions of main_ui and main_worker to load the newly added modules.
[33mc9df06a[m Chnaged 'EditorUI' namespace identifier to 'Editor'.
[33m6146117[m Added thread_msg_ui and thread_msg_worker modules.
[33m0a2ad55[m Added file_ops and prog_load modules.
[33me82d27a[m Added an 'about' module.
[33m23f4b10[m Renamed mountToggle() to mountToggleBtn() in debug_ui module.
[33ma1f3bb5[m Added setStatusElement() export function to editor module.
[33mea40064[m Moved debugToggleBtn from editor module to debug_ui module.
[33ma023f4d[m Removed the insertPosition parameter from the mount() functions in all UI modules.
[33m52ceeeb[m Renamed editor_ui module to 'editor'.
[33m4d3276f[m Modified editor_ui to use dependency injection to reference the statusBar element instead of importing main_ui module.
[33m91660f2[m Modified main_ui module to create the mainDiv, statusBar, and versionDiv elements separate from mounting them along with the other component elements.
[33ma295a7d[m Removed mainDiv from the exports of main_ui module.
[33m1921488[m Moved the 'version' HTML into the main HTML template string in main_ui module.
[33m5aff267[m Renamed setMainUIEvents() function to setEvents() in main_ui module.
[33m84ba56e[m Added insertPosition parameter to the mount() functions in canvas_ui, console_ui, debug_ui, and editor_ui modules.
[33m68dd1f8[m Replaced references to mainDiv with debugDiv.parentElement in debug_ui.
[33m3da2364[m Renamed 'parentElement' parameter of mount() function  to 'targetElement' in canvas_ui, console_ui, debug_ui, and editor_ui modules.
[33m77ceafc[m Modified editor_ui module to make the mounting of its elements independent of the main_ui module.
[33m236b2a6[m Modified debug_ui module to make the mounting of its elements independent of the main_ui module.
[33m8533d81[m Renamed setSpriteUIEvents() to setEvents() in sprite_ui module.
[33m3ef8c83[m Renamed setSoundUIEvents() to setEvents() in sound_ui module.
[33me6ac283[m Modified console_ui module to make the mounting of its elements independent of the main_ui module.
[33m61c8853[m Modified canvas_ui module to make the mounting of its elements independent of the main_ui module.
[33m90a5662[m Modified main_worker module to lazy-load the other worker modules.
[33mcdbe1ec[m Modified main_ui module to lazy-load all of the other UI modules.
[33m5a452cc[m Modified index and main_ui module to run the main_ui and main_worker modules as ES6 modules.
[33m4856fc4[m Converted editor_ui module to ES6 module.
[33m9b81b21[m Converted debug_ui module to ES6 module.
[33mfa26298[m Converted sprite_ui module to ES6 module.
[33ma0542fc[m Converted sound_ui module to ES6 module.
[33mfa911c6[m Converted console_ui module to ES6 module.
[33m4f3de43[m Converted canvas_ui module to ES6 module.
[33m1dfb3d8[m Converted main_ui module to ES6 module.
[33m3a39e0a[m Converted sprite_worker module to ES6 module.
[33m502ed71[m Converted sound_worker module to ES6 module.
[33mc0f1458[m Converted debug_worker module to ES6 module.
[33mdfe8416[m Converted console_worker module to ES6 module.
[33me5dba99[m Converted canvas_worker module to ES6 module.
[33mada5899[m Added setExpectedResultMessageID(() function export to main_worker module.
[33maaddfb7[m Added setMainMode() function export to main_common module.
[33mda7605c[m Changed mainVM in main_worker module to a const.
[33m743a384[m Converted main_worker module to ES6 module.
[33m7c4b1af[m Converted all common modules to ES6 modules.
[33m24cb1ef[m Converted std_funcs to ES6 module.
[33m8960292[m Converted vm module to ES6 module.
[33md2c3caf[m Converted objects module to ES6 module.
[33mdf9351e[m Converted bytecode module to ES6 module.
[33m284612d[m Changed the import module namespace identifiers to PascalCase.
[33meff5af6[m Converted compiler module to ES6 module.
[33m502d66b[m Converted scanner module to ES6 module.
[33mc7bd2e2[m Converted token module to ES6 module.
[33m7d7169a[m Added 'exports' section to dependencies file.
[33m2d3479a[m Removed redundant declaration of 'mainDiv' in debug_ui module.
[33md4c1d9e[m Finished mapping source module dependencies.
[33mb072535[m Added to dependencies file.
[33md6159e4[m Finished mapping dependencies amoung core modules in 'dependencies' file.
[33me202c8e[m Removed 'lib' directory from '/source/core' directory.
[33mb0d4f54[m Updated dependencies file.
[33mfaa6f72[m Added a 'dependencies' file to map identifier depenedencies between modules.
[33md70ac72[m Removed obsolete updates log.
[33m77ee6e9[m Renamed 'object' module to 'objects'.
[33m1734727[m Moved constants SOURCE_LEVEL_TOP and SOURCE_LEVEL_FUNC from compiler module to object module.
[33m2ad8dd8[m Added to TODO list.
[33m272f2d2[m Updated the TODO list.
[33m888c5dc[m Updated TODO list.
[33mf6dd6d3[m Updated TODO list.
[33m72567b7[m Updated the Updates page.
[33m2c1c8f0[m Modified layout of Updates page.
[33md11278d[m Fixed bug: 'In Firefox, the canvas does not scroll into view when it is initially hidden and the showCanvas() native function is used.'
[33meb524b4[m Updated TODO list.
[33mb400b27[m Added to the TODO list.
[33m6c76e61[m Updated the TODO list.
[33m21026fe[m Removed zip file of previous version.
[33m90fdf88[m Marked the Updates log as obsolete, since Git log serves the same purpose.
[33md478444[m Resolved merge conflicts.
[33m58bebd3[m[33m ([m[1;33mtag: [m[1;33mv2.1.1[m[33m)[m Fixed bug with the canvas in Firefox not scrolling into view when gaining focus.
[33m328aec3[m Fixed typo in Update log.
[33mf726516[m Added canvas scroll-to bug to TODO list.
[33m9c16e4e[m Started version 2.2.0.
[33m77cd4b9[m[33m ([m[1;33mtag: [m[1;33mv2.1.0[m[33m)[m Fixed bug with link to rayIntersectsRect help file.
[33me5d0c08[m Added an icon image to the About dialog.
[33meff8607[m Changed the About dialog's call-to-action list style from inline-block to block.
[33m01acd01[m Added to TODO list.
[33m38ce4e6[m Fixed bug with the favicon not loading.
[33m5c83583[m Fixed bug with incorrect relative URLS when using auto-run in the main Help page.
[33m9b41919[m Fixed bug with incorrect relative URLs in Examples page.
[33ma751f9c[m Fixed bug with incorrect relative URLs.
[33mf63fd75[m Updated the Updates page.
[33mf0a690b[m Added guard flags to the new, open, and save operations in the code editor to keep multiple operations from being initiated simultaneously.
[33mbc2a1aa[m Added a compressed file of the current production version to the local repository.
[33m1d2e92b[m Updated test checklist.
[33m45d007e[m Updated test checklist.
[33mcc59cd6[m Tweaked the layout of the Updates page.
[33m5873011[m Updated test checklist.
[33m3aee02f[m Fixed typo in the File Commands help page.
[33m0874ae9[m Added DEFAULT_FILE_NAME constant to editor_ui module to hold the default name for an unsaved code file.
[33mde6b9db[m Fixed typos in Updates page.
[33mcd8a2ab[m Updated the Updates page.
[33m7bdc735[m Updated the File Commands help page.
[33m77db7d1[m Updated the images for the Code Editor and Debugger help pages.
[33mc675fdf[m Fixed bug with codeFileHandle remaining 'undefined' after opening a code file in editor_ui module.
[33m9d569bf[m Added ability to store an open file's handle in editor_ui module.
[33mde42007[m Added filePickerOptions to editor_ui module.
[33mf1071d9[m Added try/catch blocks to saveBtn_onClick().
[33ma541663[m Modified editorUI_onMainReset() to set codeFileHandle to null.
[33m045af45[m Moved codeHasChanged check from saveBtn_onClick() to saveCodeFileFromAnchor() in editor_ui module.
[33m78969b8[m Modified loadCodeFileIntoEditor() in editor_ui module to only change codeFileName if the given CodeFile's name isn't empty.
[33mb8c0ed8[m In editor_ui module, modified newBtn_onClick() and openBtn_onClick() to confirm the new/open action instead of the save action, and moved the logic of saveCodeFile() back into saveBtn_onClick().
[33m659aa12[m Added skeleton code for opening/saving a file using a file handle in editor_ui module.
[33mfa33e40[m Modified readCodeFileFromURL() and readCodeFileFromLocalStorage() in editor_ui module to be async.
[33mbe9fff8[m Extracted logic for reading code files from local storage from readCodeFileFromURL() to the new function readCodeFileFromLocalStorage() in editor_ui module.
[33m4da482b[m Modified readCodeFileFromInput(), openBtn_onClick(), and window_onLoad() to use async/await.
[33mac0b833[m Added 'save changes' confirmation to newBtn_onClick() and openBtn_onClick() functions in editor_ui module.
[33m211e15b[m Renamed loadCodeFile() to loadCodeFileIntoEditor() in editor_ui module.
[33m0f46297[m Moved logic of saveBtn_onClick() function into new function saveCodeFile() in editor_ui module.
[33m4feea1c[m Extracted code-file-saving logic from saveBtn_onClick(), and put it into the new function saveCodeFileFromAnchor().
[33m9f8dec1[m Created CodeFile class to hold file name and data when reading/loading a code file.
[33m889d932[m Renamed loadCodeFileFromURL() to readCodeFileFromURL(), and moved its loadCodeFile() call to window_onLoad() in main_ui module.
[33mf6bf3d3[m Extracted editor code-loading logic from loadCodeFileFromURL() and openBtn_onClick, and put it into the new function loadCodeFile().
[33m8eaccd3[m Renamed loadSourceFile() to loadCodeFileFromURL().
[33m5e9b839[m Revert "Renamed loadSourceFile() to readCodeFileFromURL()."
[33mb717b1e[m Renamed loadSourceFile() to readCodeFileFromURL().
[33mee671dc[m Renamed mainUI_onProgEnd() to endProg() in main_ui module.
[33m0740af1[m Modified resetMain() in main_ui module to reset the status bar's text.
[33m75814a5[m Fixed typo in openBtn_onClick() in editor_ui module.
[33mca1971f[m Modified UI modules to reset on file new/open, instead of reloading the whole page.
[33mdd72d5b[m Made file buttons become disbaled on program run.
[33mab034fa[m Added to TODO list.
[33mde7319e[m Changed label of 'Open File' button to 'Open'.
[33mb7de502[m Removed the 'Open URL' button from editor_ui module.
[33m374db7a[m Updated version number.
[33m0ae52d9[m Add ability to display the name of a file opened with 'Open File' or 'Open URL'.
[33m94c1045[m Removed codeHasChangedDisplay and replaced it by just adding an asterisk to the end of the codeFileNameDisplay text.
[33m5744c81[m Renamed codeFileNameInput back to codeFileNameDisplay and removed ability to edit its contents.
[33m880e73b[m Add a codeHasChangedDisplay element to the editor_ui module.
[33mdbdd3a6[m Renamed codeFileNameDisplay element to codeFileNameInput.
[33m4774bfd[m Added an input event handler to the file name display to make its value correlate with the value of codeFileName.
[33m6174b30[m Added a file name display to the editor.
[33m57cd689[m - Modified the 'Save' button event handler in the editor_ui module to temporarily attach the anchor element to the document body before activating it. - Modified the 'Open File' button event handler in the editor_ui module to temporarily attach the input element to the document body before activating it.
[33m39e6357[m Added codeFileName to editor_ui module.
[33m8fcbee6[m Merge branch 'main' of https://github.com/Sinusoid314/LoganBASIC
[33m9e53d0a[m Modified editor module to open new and existing files in the same tab, fixing a bug where the browser was blocking the opening of a new tab following the use of the file picker. Added codeHadChanged flag to warn the user if there are unsaved code changes when the tab is set to unload.
[33mbe49962[m - Modified editor module to open new and existing files in the same tab, fixing a bug where the browser was blocking the opening of a new tab following the use of the file picker.
[33md5d8591[m Added 'Syntax highlighting' to TODO list.
[33m2d43586[m Updated the images for the Code Editor and Debugger help pages to reflect the new UI design.
[33m9641e81[m Added 'Update help page images' to the TODO list.
[33m8628c0e[m Updated the updates page.
[33md7a0407[m Modified debug pane resizing to take the pane's border size into account when calculating its scrollbar width.
[33m1da6ed2[m Fixed bug with debug pane not positioning properly when displaying and resizing.
[33m3a93304[m Modified some native function implementations to use inline-if operators to assign optional argument values.
[33meeb5db6[m Modified Memory Match example to utilize the  clearRect() and drawCanvasBufferClip() native functions.
[33md0c558f[m Added drawCanvasBufferClip() canvas native function.
[33m3eaad6a[m Modified Memory Match example to utilize the timerIsRunning() native function.
[33mbedf082[m Added clearRect() canvas native function.
[33m371b448[m Fixed bug in Memory Match example, where text had random transparent patches when drawing header, by making the buffer canvas an OffscreenCanvas object.
[33mba77701[m Modified getTextDrawWidth() and getTextDrawHeight() native functions to return only integers.
[33m7f05e44[m Fixed bug in example code for drawCanvasBuffer(), enableCanvasBuffer(), and disableCanvasBuffer() help pages where the program was ending before the buffer could be drawn.
[33m119f512[m Removed the note regard the drawBufferInProgress check from the drawCanvasBuffer() help page.
[33m2e889b2[m Removed drawBufferInProgress check to allow generating more than one animation-frame request at a time.
[33m994ce85[m Removed the callback-function parameter for the drawCanvasBuffer() canvas native function.
[33m215bc6f[m Fixed bug where text drawn on canvas is incorrectly positioned.
[33mac4f59c[m Changed all of the message ID values in the common modules to unique string values.
[33md3481fe[m Added timerIsRunning() standard function.
[33mf1bc655[m Added a game timer to Memory Match example.
[33m5033c5e[m Added a try counter to Memory Match example.
[33mc9da7cb[m Changed the debugger pane's style to the 'button face' style.
[33m2ab74e4[m Added to Memory Match example.
[33m51178dd[m Added a 'Refactors' section to the TODO file.
[33mea6cd2b[m Fixed bug with canvas text being drawn relative to its bottom position instead of its top.
[33m6804247[m Added getTextDrawWidth() and getTextDrawHeight() canvas native functions.
[33m6ed77e8[m Updated TODO file.
[33me5b7615[m Finished basic gameplay logic of Memory Match example.
[33mdfba5d3[m Added to Memory Match example.
[33m8560f85[m Added to Memory Match example.
[33md6d749e[m Added to Memory Match example.
[33m25a48b4[m Modified the Updates highlighting animation to stop after 3 cycles.
[33mbb26fed[m Modified the condition for highlighting the Updates button to not highlight it if the About dialog is shown on the first page visit.
[33mb86ce6d[m Added toggleUpdatesBtnHighlighted() function in editor_ui module to switch the Update button's highlighting on or off.
[33m476c80f[m Modified the Updates button to be highlighted when the user first visits a new version of the site.
[33me3658fb[m Added icon images to the Debugger buttons.
[33md9f4ba4[m Added icon images to the Editor buttons.
[33med5aed7[m Tweaked the main page style.
[33mcc192e6[m Fixed the styling for the About dialog's call-to-action list to make it centered and bold.
[33m28e6da5[m Modified the toolbar and button styles to resemble a Windows98 look.
[33m01b3207[m Added a button-face style to the About dialog.
[33me080ce8[m Added more calls-to-action to the About dialog.
[33mef2ecde[m Moved the Updates link from main_ui module to a button in editor_ui module.
[33m2bdb426[m Moved the About dialog from main_ui module to editor_ui module.
[33m4e84653[m Modified the mechanism for showing the About dialog only on the first visit to the main page.
[33m65f3a4a[m Added hasVisited flag and checkVisitStatus() function to make the About dialog only show on the first visit to the main page.
[33m186957b[m Modified window_onLoad event to display the About dialog if no program is being opened on startup.
[33mb105c0c[m Converted About page to a popup dialog on the main page.
[33m37a6cbc[m Added ability to auto-run the example programs when opened.
[33m5f58f41[m Added to Memory Match example.
[33me42caef[m Added to Memory Match example.
[33m4ba682f[m Added to Memory Match example.
[33m424608c[m Modified to Memory Match example.
[33mcc743bf[m Added item to TODO list.
[33m701db07[m Added to Memory Match example.
[33mb5d57ca[m Added to Memory Match example.
[33m4372ae0[m Fixed bug with the statusBar interpreting its contents as HTML instead of plain text.
[33mb17155f[m Fixed the link texts in the help page descriptions for the startTimer() and stopTImer() native functions.
[33md6158ab[m Added images for Memory Match example.
[33mc0472a9[m Created source file for Memory Match example.
[33m44e53ff[m Tested Canvas and Sprite help page usage code.
[33m6b1e691[m Modified the help file system's reference_doc script to avoid referencing elements that are not present in the given help page.
[33m13a2fc4[m Modified the help file system's 'test mode' to avoid loading a page that does not have a 'usageCode' element.
[33m7f51428[m Added a call to the showCanvas() native function to all help page usage code sections that use the canvas.
[33m8d9b754[m Added a 'test mode' to the help file system, to enable quicker testing of usage code in each help page.
[33m76f1804[m Updated the Update page.
[33m4460ae9[m Tested Standard Functions.
[33md904d2e[m Modified usage code in help page for rectOverlapsCircle() to make the shapes overlap.
[33m29fcca3[m Fixed bug in import_onLoad() in std_funcs module where the interpreter result was being put in an undefined variable.
[33m6fea262[m Fixed the link texts in the help page descriptions for the loadSound(), setSoundPos(), and unloadSound() native functions.
[33m29342f8[m Tested Code Editor, Debugger, Statements, Sound Functions, and Expression Operators.
[33m7be5b05[m Tested Examples.
[33mcc16890[m Added a test checklist.
[33mbfc736c[m Modified Space Shooter example to make the explosion animations slightly faster.
[33mf2c07d6[m Modified the Bouncing Sprites example to give the lowest sprite animation rate a higher value.
[33mb8eb3e6[m Fixed the link texts in the help page descriptions for the loadImage() and unloadImage() native functions.
[33md346737[m Fixed bug in HiLo example where typing 'q' was not ending the program.
[33mac2663e[m Commented out all non-error-reporting console logs.
[33mc5cc97a[m Updated the help pages for, and examples using, the updateSprites() native function to reflect the change to using seconds to measure sprite frame duration, the deltaTime argument being made mandatory, and to use the updateDeltaTime() native function instead of manually updating each frame's deltaTime.
[33mb3448c0[m Renamed frameSecondCount member of Sprite class in sprite_worker module to frameElapsedSeconds.
[33m6d20709[m Updated the help pages for, and examples using, the getSpriteFrameRate() and setSpriteFrameRate() native functions to reflect the change to using seconds to measure sprite frame duration.
[33me39e51c[m Fixed bug with sprite frames not playing properly by changing the measure of sprite frame duration from milliseconds to seconds.
[33m60c47a2[m Modified updateSprites(), getSpriteFrameRate(), and setSpriteFrameRate() native functions to use milliseconds instead of update counts to measure sprite frame duration, and made mandatory the deltaTIme argument of the updateSprites() native function.
[33m4227b92[m Updated the updates.html page.
[33mcf80a61[m Fixed bug in the Platformer example where Bubba was falling through the platform.
[33m3239003[m Increased the time timeEpsilon to 0.001 in the rayIntersectsRect() function of the sprite_worker module.
[33md0da699[m Modified Platformer example to use spritesCollided() native function.
[33mde71a9a[m Added resolveSpriteCollisionX() and resolveSPriteCollisionY() native functions.
[33mb7d9df5[m Finished help pages for spritesCollided(), setSpriteHitBoxOffsetX(), setSpriteHitBoxOffsetY(), setSpriteHitBoxWidth(), setSpriteHitBoxHeight(), getSpriteHitBoxOffsetX(), getSpriteHitBoxOffsetY(), getSpriteHitBoxWidth(), and getSpriteHitBoxHeight() native functions.
[33md52dd80[m Fixed bug where sprites' prevY property was not being set correctly in funcUpdateSprites() in sprite_worker module.
[33m9ab033f[m Finished help page for resolveSpriteCollision() native function.
[33m600c178[m Finished the description to the help page for spritesCollided() native function.
[33m7a24025[m Finished the description to the help page for resolveSpriteCollision() native function.
[33m2e97ced[m Renamed resolveLastSpriteCollision() native function to resolveSpriteCollision().
[33m15e3f64[m Renamed spritesHaveCollided() native function to spritesCollided().
[33m62bedfc[m Removed spritesWillCollide() and resolveNextSpriteCollision() native functions.
[33m6216577[m Started the description to the help page for the resolveLastSpriteCollision() native function.
[33mb40b6e1[m Removed testSpriteX, testSpriteY, referenceSpriteX, and referenceSpriteY members from SpriteContact class, and removed references to them from spriteCollisionExists(), in sprite_worker module.
[33m63a57d4[m Added resolveLastSpriteCollision() and resolveNextSpriteCollision() native functions.
[33ma433ecf[m Added testSpriteX, testSpriteY, referenceSpriteX, and referenceSpriteY members to SpriteContact class, and updated spriteCollisionExists() to utilize them, in sprite_worker module.
[33m240afe3[m Modified spritesHaveCollided() native function to use prevUpdateDeltaTime instead of a user-provided deltaTime argument.
[33mae5175c[m Added prevUpdateDeltaTime to hold the deltaTime value (if any) that was used in the last call to the updateSprites() native function.
[33m6bafcdc[m Updated the update log.
[33mbb17777[m Updated the update log.
[33m884f973[m Added the 'contactStruct' part of the help page description for the spritesWillCollide() and spritesHaveCollided() native functions.
[33m72ae4d7[m Fixed a bug in rayIntersectsRect() function in sprite_worker module where a false negative is returned when the entryTime is within the interval [0,1).
[33m02e8cc5[m Added descriptions to the help pages for setSpriteHitBoxOffsetX(), setSpriteHitBoxOffsetY(), setSpriteHitBoxWidth(), setSpriteHitBoxHeight(), getSpriteHitBoxOffsetX(), getSpriteHitBoxOffsetY(), getSpriteHitBoxWidth(), and getSpriteHitBoxHeight() native functions.
[33m1742314[m Finished help pages for setMaxDeltaTime() and getMaxDeltaTime() native functions.
[33ma0116ae[m Updated TODO and Updates files.
[33mb33f3a9[m Finished help pages for updateDeltaTime(), getDeltaTime(), and resetDeltaTime() native functions.
[33me5a557f[m Updated the version updates page.
[33mad59bf5[m Modified the help page for the rayIntersectsRect() native function to give the normalX and normalY values their own list element.
[33m9c2c4bb[m Removed the pointX and pointY members of SpriteContact class in sprite_worker module.
[33m3efdf16[m Added descriptions to the help pages for updateDeltaTime(), getDeltaTime(), setMaxDeltaTime(), getMaxDeltaTime(), and resetDeltaTime() native functions.
[33m996c67a[m Added a SpriteContact class in sprite_worker module in order to decouple the rayIntersectsRect() helper function from the ObjStructure class.
[33m2f4ab05[m Added spritesWillCollide() and spritesHaveCollided() sprite native functions.
[33m06ab2b3[m Added links to new template help files in main help file.
[33m98f0c3c[m     - Created a template for help file pages.     - Created the template pages for updateDeltaTime(), getDeltaTime(), setMaxDeltaTime(), getMaxDeltaTime(), resetDeltaTime(), spritesWillCollide(),       spritesHaveCollided(), setSpriteHitBoxOffsetX(), setSpriteHitBoxOffsetY(), setSpriteHitBoxWidth(), setSpriteHitBoxHeight(), getSpriteHitBoxOffsetX(),       getSpriteHitBoxOffsetY(), getSpriteHitBoxWidth(), and getSpriteHitBoxHeight() native functions.
[33mce16b40[m Added setSpriteHitBoxOffsetX(), setSpriteHitBoxOffsetY(), setSpriteHitBoxWidth(), setSpriteHitBoxHeight(), getSpriteHitBoxOffsetX(), getSpriteHitBoxOffsetY(), getSpriteHitBoxWidth(), and getSpriteHitBoxHeight() sprite native functions.
[33m673ec95[m Finished the help page for rayIntersectsRect() native function.
[33mc4edf7d[m Added demonstration of normalX and normalY members of contactStruct to help page for rayIntersectsRect() native function.
[33m797ef03[m Modified funcRayIntersectsRect() in std_funcs module to account for the situation where the normalX and normalY members of contactStruct should be 0.
[33mc0a4194[m Updated help file for rayIntersectsRect() native function.
[33m2213ee0[m Resolved conflict between old and new versions of 'LoganBASIC Grammar.txt'
[33m97ba811[m Initial local commit.
[33m3c378fe[m Add files via upload
[33m534047f[m Add files via upload
[33m26429af[m Add files via upload
[33m5e67415[m Add files via upload
[33m7a8ce1d[m Add files via upload
[33mb5212d2[m Add files via upload
[33m4a10039[m Add files via upload
[33mc54db5d[m Add files via upload
[33m9df865c[m Add files via upload
[33m8c1e6f4[m Add files via upload
[33mb7c1b5b[m Add files via upload
[33md7140ec[m Add files via upload
[33mbbd5f17[m Add files via upload
[33m5a26b3a[m Add files via upload
[33m3506dbd[m Add files via upload
[33mbb13f3b[m Add files via upload
[33m78bf1fa[m Add files via upload
[33mbf194db[m Add files via upload
[33m566d701[m Add files via upload
[33m49daf70[m Add files via upload
[33mc7d17ae[m Add files via upload
[33m9b75758[m Add files via upload
[33m1d62f73[m Add files via upload
[33mb1df191[m Add files via upload
[33m6dd1649[m Add files via upload
[33m5deb9fb[m Add files via upload
[33m122e8b0[m Add files via upload
[33m1d37236[m Delete docs/help/main_overview.html
[33md8fa8bf[m Add files via upload
[33m4edb392[m Add files via upload
[33mff1d369[m Add files via upload
[33mfd5ca01[m Add files via upload
[33ma99362b[m Add files via upload
[33m94a61ee[m Add files via upload
[33ma33b4fe[m Add files via upload
[33mf3b9e50[m Add files via upload
[33m8b2051f[m Add files via upload
[33mfd884d2[m Add files via upload
[33mbde451e[m Add files via upload
[33mf9347b0[m Add files via upload
[33m74fb093[m Add files via upload
[33m7e37bb4[m Add files via upload
[33m8d8d20f[m Add files via upload
[33m53f8f9b[m Add files via upload
[33m72d297c[m Add files via upload
[33m4489cfa[m Add files via upload
[33mba1115d[m Add files via upload
[33meb8dd53[m Add files via upload
[33m61cdf65[m Add files via upload
[33m9c62507[m Add files via upload
[33m94e6036[m Add files via upload
[33m588e0ff[m Add files via upload
[33m59bfff0[m Add files via upload
[33m570ec44[m Add files via upload
[33m3cbe9a7[m Delete test directory
[33m28a29fb[m Add files via upload
[33me4b537d[m Add files via upload
[33m8be3a54[m Add files via upload
[33m09f52b1[m Add files via upload
[33m4d3081d[m Add files via upload
[33m6f36f8a[m Add files via upload
[33mc6b56b8[m Add files via upload
[33m107aeab[m Add files via upload
[33m2cba402[m Add files via upload
[33m4f83636[m Add files via upload
[33m71ad6c3[m Add files via upload
[33m3980d64[m Add files via upload
[33mc7c53e7[m Add files via upload
[33me778326[m Add files via upload
[33m5fd531b[m Add files via upload
[33mafef6c6[m Add files via upload
[33m4833757[m Add files via upload
[33mdfd65a9[m Add files via upload
[33m5ffc8fd[m Add files via upload
[33mac00af7[m Delete source directory
[33m29fe93a[m Add files via upload
[33m05ef941[m Add files via upload
[33m01d3cd7[m Add files via upload
[33mcb362ad[m Delete source directory
[33m6b62891[m Add files via upload
[33m9ae603b[m Add files via upload
[33madd1787[m Add files via upload
[33mb57622d[m Add files via upload
[33me5fb2cf[m Delete source directory
[33md26c555[m Add files via upload
[33m3c29e68[m Delete source directory
[33m8528ea4[m Add files via upload
[33mcdca3ba[m Delete source directory
[33md0a0243[m Update README.md
[33m8289438[m Add files via upload
[33m93e5c2b[m Delete thread_common.js
[33m1f42128[m Delete loganbasic.css
[33m8d4f360[m Add files via upload
[33mcedfc34[m Add files via upload
[33m3d23a6e[m Add files via upload
[33m50b0114[m Add files via upload
[33m5e26ab7[m Add files via upload
[33m9a937f4[m Add files via upload
[33m39f5ef3[m Add files via upload
[33me3b8db4[m Add files via upload
[33m8637b95[m Add files via upload
[33m4405e5e[m Add files via upload
[33me27b4bf[m Add files via upload
[33m107162e[m Add files via upload
[33mfb25b04[m Delete docs/help/functions/canvas directory
[33meb06d42[m Add files via upload
[33mb47c13a[m Add files via upload
[33m7c6fa9b[m Add files via upload
[33m34c50db[m Add files via upload
[33m0721372[m Add files via upload
[33m393b280[m Add files via upload
[33m0853ae4[m Add files via upload
[33m2fb4995[m Add files via upload
[33m8c46771[m Add files via upload
[33m88574ec[m Add files via upload
[33mc68e9bf[m Add files via upload
[33mceaba73[m Add files via upload
[33mce6e09e[m Add files via upload
[33m794025e[m Add files via upload
[33m0d56179[m Add files via upload
[33mb665c8d[m Add files via upload
[33me5fffda[m Delete player-ship.png
[33ma9d241b[m Add files via upload
[33mb276b82[m Add files via upload
[33m785268e[m Add files via upload
[33md4d37c6[m Add files via upload
[33me76ce66[m Add files via upload
[33me44c262[m Add files via upload
[33m1d69f50[m Add files via upload
[33mc1af1f5[m Add files via upload
[33mb686997[m Add files via upload
[33me7d5d73[m Add files via upload
[33m907281b[m Add files via upload
[33m16b0d5a[m Add files via upload
[33me575016[m Add files via upload
[33mfeb9e42[m Add files via upload
[33me7947a4[m Delete docs/help/debugger directory
[33m601fa52[m Add files via upload
[33mb4a8995[m Add files via upload
[33m267d7f4[m Delete docs/help/debugger directory
[33m0a181ed[m Add files via upload
[33mcbe55ad[m Add files via upload
[33m8ede068[m Add files via upload
[33m8306d9d[m Add files via upload
[33me39da04[m Add files via upload
[33m7594aba[m Add files via upload
[33m80660a1[m Add files via upload
[33me99d4c7[m Add files via upload
[33m6556251[m Add files via upload
[33m4df40ee[m Add files via upload
[33m2082469[m Add files via upload
[33mb8bf8e5[m Add files via upload
[33mc98dcc6[m Add files via upload
[33ma1b3162[m Add files via upload
[33m8451c6f[m Add files via upload
[33ma6f15bd[m Add files via upload
[33mf9dfe63[m Add files via upload
[33meae6822[m Add files via upload
[33mc86cc6f[m Add files via upload
[33md3c717a[m Add files via upload
[33ma32478a[m Add files via upload
[33m15daca2[m Add files via upload
[33m47ea85c[m Add files via upload
[33mb670f2d[m Add files via upload
[33mdcc5e84[m Add files via upload
[33mf1b623b[m Add files via upload
[33m6f781a4[m Delete hideeditor.html
[33m84f6713[m Delete showeditor.html
[33m23354dd[m Add files via upload
[33mbaa3c0d[m Add files via upload
[33ma087540[m Add files via upload
[33mc68d6a6[m Add files via upload
[33m00da3e1[m Add files via upload
[33mf0eac8d[m Add files via upload
[33mce79c7a[m Delete displays.html
[33m5807eb6[m Add files via upload
[33me28c575[m Add files via upload
[33meebfe34[m Add files via upload
[33md7b16c7[m Add files via upload
[33m35b7384[m Add files via upload
[33m3cf6c71[m Add files via upload
[33mce0ca1e[m Add files via upload
[33m551b133[m Add files via upload
[33mb049a96[m Add files via upload
[33m5e24773[m Add files via upload
[33m10a1f2b[m Delete examples directory
[33m3329472[m Add files via upload
[33md27a4ea[m Delete docs/help/statements directory
[33m2aa3981[m Add files via upload
[33m7b98931[m Add files via upload
[33maeb7f48[m Add files via upload
[33ma1fd396[m Delete temp.txt
[33m7b78c18[m Add files via upload
[33mb592173[m Create temp.txt
[33md94a97f[m Delete functions
[33m334685d[m Create functions
[33m8345db4[m Delete docs/help/functions/standard directory
[33mc5e5371[m Delete docs/help/functions/sprite directory
[33ma7cf7af[m Delete docs/help/functions/sound directory
[33m82ebfbd[m Delete docs/help/functions/canvas directory
[33md2d4ae2[m Add files via upload
[33mf02f98d[m Add files via upload
[33m5020950[m Add files via upload
[33mfe79ef8[m Add files via upload
[33m24a22a8[m Add files via upload
[33m52d01b8[m Add files via upload
[33mc00b02f[m Add files via upload
[33mb7b1982[m Add files via upload
[33m98495cd[m Add files via upload
[33m7082a61[m Add files via upload
[33mee88aa0[m Add files via upload
[33mb46d912[m Add files via upload
[33md080278[m Add files via upload
[33m481d686[m Add files via upload
[33m8857645[m Add files via upload
[33m4ba7ff2[m Add files via upload
[33m6a8ea77[m Add files via upload
[33m455b14d[m Add files via upload
[33maa0cef5[m Add files via upload
[33m43c2cee[m Add files via upload
[33m6cd9c2d[m Add files via upload
[33m3b7139a[m Add files via upload
[33m2acb509[m Add files via upload
[33m18d59a4[m Add files via upload
[33m01c3a56[m Delete worker_msg.js
[33m10eae23[m Add files via upload
[33m7d6c027[m Add files via upload
[33m13c903b[m Add files via upload
[33m1f1d462[m Add files via upload
[33m0e3452c[m Add files via upload
[33ma683e19[m Add files via upload
[33m2f9bee0[m Add files via upload
[33m674dd3f[m Add files via upload
[33mf901c3c[m Add files via upload
[33m4253b2a[m Add files via upload
[33m08d7b03[m Add files via upload
[33md09871e[m Add files via upload
[33mc3a936d[m Add files via upload
[33m04d3a84[m Add files via upload
[33md1cb9ff[m Add files via upload
[33ma8ea993[m Add files via upload
[33me2a2663[m Add files via upload
[33m748510d[m Add files via upload
[33m28bca96[m Add files via upload
[33m7c40432[m Add files via upload
[33mbd38eb9[m Add files via upload
[33m1a63b01[m Add files via upload
[33m0ac62bb[m Add files via upload
[33m3489854[m Add files via upload
[33m2aec5c2[m Add files via upload
[33m582b196[m Add files via upload
[33m7d8d05f[m Add files via upload
[33me2a4671[m Add files via upload
[33m3efa85a[m Add files via upload
[33m746586e[m Add files via upload
[33m149e4c2[m Add files via upload
[33m296516e[m Add files via upload
[33mac4657c[m Add files via upload
[33m7a1e968[m Add files via upload
[33mae416e0[m Add files via upload
[33m8f5af72[m Add files via upload
[33m9079a12[m Add files via upload
[33me4c3e6c[m Add files via upload
[33mfd82620[m Add files via upload
[33m31a9b77[m Add files via upload
[33m57f307b[m Delete eval.html
[33m09c6cfa[m Add files via upload
[33m264ea2b[m Add files via upload
[33m169e367[m Add files via upload
[33mc63296e[m Add files via upload
[33m66d00d0[m Add files via upload
[33m6e348c4[m Add files via upload
[33m205d6f8[m Add files via upload
[33m34b21fd[m Add files via upload
[33m71121b4[m Add files via upload
[33m929699d[m Add files via upload
[33me9cc35d[m Delete source directory
[33md22431e[m Add files via upload
[33m1a1c35f[m Add files via upload
[33mf250c69[m Add files via upload
[33m4ff06dc[m Add files via upload
[33m9d51522[m Add files via upload
[33m3eb5383[m Add files via upload
[33m2de187c[m Add files via upload
[33mc26b93a[m Add files via upload
[33m3af44dc[m Delete LoganBASIC.tws
[33m9c7c6ce[m Add files via upload
[33mb242125[m Add files via upload
[33m154e2d6[m Add files via upload
[33m6914b47[m Add files via upload
[33m57bc98c[m Add files via upload
[33me6ebac5[m Add files via upload
[33mb2f8465[m Add files via upload
[33mc384140[m Add files via upload
[33m8288788[m Add files via upload
[33m9f7c4b1[m Add files via upload
[33mec09ae7[m Add files via upload
[33m28cac74[m Add files via upload
[33m8f1a375[m Add files via upload
[33m21e6654[m Add files via upload
[33mc4d3800[m Add files via upload
[33m049c0b3[m Add files via upload
[33mfceef5e[m Add files via upload
[33mb64a2cb[m Add files via upload
[33m2634e91[m Add files via upload
[33mfa189db[m Add files via upload
[33m86052bd[m Add files via upload
[33mae7b281[m Add files via upload
[33m3680747[m Add files via upload
[33m4cccad9[m Add files via upload
[33m82cf71c[m Add files via upload
[33mdd80863[m Add files via upload
[33me4289f5[m Delete old compiler code
[33m3363348[m Add files via upload
[33m41d5324[m Add files via upload
[33m17f87e4[m Add files via upload
[33mf35710f[m Add files via upload
[33mb2874c4[m Add files via upload
[33mde037d3[m Add files via upload
[33m09921b4[m Add files via upload
[33m5c548db[m Delete source directory
[33mf07568e[m Add files via upload
[33m8a72866[m Add files via upload
[33m6567ec5[m Delete runtime.js
[33m1e314d7[m Rename source/core/lbcore.1.8.7.min.js to source/core/lib/lbcore.1.8.7.min.js
[33m051b1fb[m Add files via upload
[33m08d6497[m Add files via upload
[33m24bfe3f[m Add files via upload
[33m6d80e85[m Add files via upload
[33mb864684[m Add files via upload
[33m335174b[m Add files via upload
[33m1e0e59b[m Add files via upload
[33meb2bec7[m Delete lbcore.1.8.6.min.js
[33m5c9b3a9[m Delete lbcore.1.8.5.min.js
[33m4901f00[m Add files via upload
[33m56c1b7f[m Add files via upload
[33mb7c8526[m Delete lbcore.1.8.min.js
[33m62d7170[m Add files via upload
[33m6d1f23e[m Add files via upload
[33mc130b7b[m Add files via upload
[33m6c34121[m Add files via upload
[33m9cb0d7d[m Add files via upload
[33m02f255c[m Add files via upload
[33m2a750d6[m Add files via upload
[33m2d9ecb6[m Rename source/std_funcs.js to source/core/std_funcs.js
[33me9528c5[m Add files via upload
[33m77e0bbd[m Delete lbcore.js
[33m064930c[m Add files via upload
[33m05c85d3[m Add files via upload
[33m739871d[m Add files via upload
[33mc7283ab[m Delete tan.html
[33mbe53a4d[m Delete sin.html
[33m874cb7c[m Delete round.html
[33mc208e00[m Delete cos.html
[33m40ad3bf[m Add files via upload
[33m5a20adf[m Add files via upload
[33m0d658ad[m Add files via upload
[33m33894b8[m Add files via upload
[33m69b4b9a[m Add files via upload
[33m9670d83[m Add files via upload
[33m15b5ac2[m Add files via upload
[33mbcae481[m Add files via upload
[33m05c8270[m Add files via upload
[33m7352fa0[m Add files via upload
[33mc9c3865[m Add files via upload
[33mf17c731[m Add files via upload
[33m72484ef[m Add files via upload
[33mefcbf2d[m Add files via upload
[33me0ec3c8[m Add files via upload
[33me6d2bd0[m Add files via upload
[33md4c0fd1[m Add files via upload
[33mc28971e[m Add files via upload
[33me52e4f8[m Add files via upload
[33md49d362[m Add files via upload
[33md96c266[m Add files via upload
[33m2230be5[m Add files via upload
[33m1ba58ef[m Add files via upload
[33m9ebe49a[m Add files via upload
[33mf32341c[m Add files via upload
[33m591061f[m Add files via upload
[33m620c755[m Add files via upload
[33m55fb1cd[m Add files via upload
[33m292aeaa[m Add files via upload
[33me4556c7[m Add files via upload
[33mae41c0a[m Add files via upload
[33m2dfbf09[m Add files via upload
[33mda63432[m Add files via upload
[33m4fe5b8a[m Add files via upload
[33m428b02f[m Delete scrollview.html
[33mb26b1ac[m Add files via upload
[33mdaaf31b[m Add files via upload
[33mbfe454d[m Add files via upload
[33m259f967[m Add files via upload
[33m2f42d40[m Add files via upload
[33m48e7c58[m Add files via upload
[33m7b04150[m Add files via upload
[33m867fa99[m Add files via upload
[33md470d8c[m Add files via upload
[33mabae09e[m Add files via upload
[33m9ebdb3b[m Add files via upload
[33m52ee6d7[m Add files via upload
[33m6cbd50e[m Add files via upload
[33md903220[m Delete curb.bmp
[33m697ac99[m Delete car.bmp
[33m0768cb8[m Add files via upload
[33mfb74d89[m Add files via upload
[33ma6dc56d[m Add files via upload
[33m9bdd81c[m Delete about.html
[33mc2eabcd[m Add files via upload
[33mf84582b[m Add files via upload
[33m6187693[m Add files via upload
[33m93f7c12[m Delete buttonchase.bas
[33m91758cd[m Add files via upload
[33m2f3bf29[m Add files via upload
[33ma0bd296[m Add files via upload
[33m1a76dd1[m Add files via upload
[33m8ba5214[m Add files via upload
[33m889ba70[m Add files via upload
[33mdb61e00[m Add files via upload
[33m0a920d2[m Add files via upload
[33mcd66857[m Add files via upload
[33mfdef549[m Add files via upload
[33m2b248ac[m Add files via upload
[33md3f4f4e[m Add files via upload
[33mf99aa53[m Add files via upload
[33m0c803d6[m Add files via upload
[33m4d2119d[m Add files via upload
[33mbcb1375[m Add files via upload
[33m54bb241[m Add files via upload
[33m8010ab4[m Add files via upload
[33mb24df46[m Add files via upload
[33m06a46a5[m Add files via upload
[33mc0cd8bd[m Add files via upload
[33m5d242e6[m Add files via upload
[33m24178c9[m Add files via upload
[33medb2adf[m Add files via upload
[33mb9a8809[m Add files via upload
[33m9a5f340[m Add files via upload
[33m5dd906d[m Add files via upload
[33mf58a5d4[m Delete examples directory
[33m7013bfb[m Add files via upload
[33m6326e38[m Add files via upload
[33m7fd7840[m Add files via upload
[33m061d2e7[m Add files via upload
[33m907d0de[m Add files via upload
[33m0470ef3[m Add files via upload
[33m6564c17[m Add files via upload
[33m93f0df1[m Add files via upload
[33ma302fc3[m Delete docs/help/functions/sprite directory
[33m3fa443d[m Add files via upload
[33me9f2f40[m Add files via upload
[33mbef183b[m Add files via upload
[33m810dc30[m Add files via upload
[33mc60754e[m Add files via upload
[33mfd2d4e7[m Add files via upload
[33m2671cbd[m Add files via upload
[33m379c2c1[m Add files via upload
[33m43570ec[m Add files via upload
[33m632df7b[m Delete docs/help/functions directory
[33m69fc7df[m Add files via upload
[33m165d350[m Add files via upload
[33mbb06c67[m Add files via upload
[33m8b3fbb7[m Add files via upload
[33m7d6779a[m Add files via upload
[33m907241b[m Add files via upload
[33mdb0f5e0[m Delete temp.txt
[33m3079d07[m Rename source/token.js to source/core/token.js
[33m2c94ec8[m Rename source/scanner.js to source/core/scanner.js
[33mba6bfff[m Rename source/runtime.js to source/core/runtime.js
[33m9a96239[m Rename source/object.js to source/core/object.js
[33m66c8dd5[m Rename source/compiler.js to source/core/compiler.js
[33md2450af[m Rename source/bytecode.js to source/core/bytecode.js
[33md474705[m Create temp.txt
[33m16cf85c[m Add files via upload
[33mb8f21b8[m Add files via upload
[33m9329a9d[m Add files via upload
[33md6f7b9a[m Add files via upload
[33m94dbf07[m Add files via upload
[33mb27820b[m Add files via upload
[33m7ecad8c[m Add files via upload
[33m7f7a901[m Delete fish.png
[33m97beec1[m Add files via upload
[33md2c5ad2[m Add files via upload
[33m0100d4c[m Add files via upload
[33m62ea91f[m Add files via upload
[33m57313c2[m Delete examples directory
[33mf0ca7cb[m Delete arrays1.bas
[33m8ef7d6f[m Add files via upload
[33mb7b0030[m Add files via upload
[33m501ce12[m Add files via upload
[33m5fbd953[m Add files via upload
[33m630dfb7[m Add files via upload
[33m6ac2cfd[m Add files via upload
[33md9a696f[m Add files via upload
[33m9e37b4d[m Add files via upload
[33m30e9a07[m Add files via upload
[33m1ee880a[m Add files via upload
[33md7c5e1d[m Add files via upload
[33m4518336[m Add files via upload
[33m75d6869[m Add files via upload
[33m4d04810[m Add files via upload
[33ma49a346[m Add files via upload
[33m09f6c5d[m Add files via upload
[33m24e1ff0[m Add files via upload
[33m25bb16b[m Add files via upload
[33m6c74d30[m Add files via upload
[33m269ab7e[m Add files via upload
[33mbf4df6d[m Add files via upload
[33m51994c8[m Add files via upload
[33m54fc2a0[m Add files via upload
[33mb06f84b[m Add files via upload
[33m801bfd5[m Add files via upload
[33m1fc390f[m Add files via upload
[33m8089777[m Add files via upload
[33m151edf5[m Delete examples directory
[33m0f6abe1[m Delete source directory
[33m2978d55[m Add files via upload
[33m5a41dd2[m Add files via upload
[33m7c643e9[m Add files via upload
[33m322ea8d[m Add files via upload
[33mc7abe3f[m Add files via upload
[33m552ef2e[m Add files via upload
[33m3c3261b[m Delete ui.js
[33m6e8aad0[m Delete editor.js
[33m5f6ad00[m Add files via upload
[33m89114fd[m Add files via upload
[33maa53565[m Add files via upload
[33mc2550c7[m Add files via upload
[33m0e456dc[m Add files via upload
[33mce64bfd[m Add files via upload
[33mc4cbbce[m Add files via upload
[33m7325a0a[m Add files via upload
[33m27b368d[m Add files via upload
[33mdc89da0[m Add files via upload
[33m525ab2a[m Add files via upload
[33m7cb1a59[m Add files via upload
[33m3adf5a7[m Add files via upload
[33m74fb39d[m Add files via upload
[33m4a7da84[m Delete main.js
[33m3c75fa6[m Add files via upload
[33m048f6d0[m Add files via upload
[33m2c069be[m Add files via upload
[33m3532fae[m Add files via upload
[33m17e526f[m Add files via upload
[33md3a4588[m Add files via upload
[33m7373202[m Add files via upload
[33mfc88ccf[m Add files via upload
[33m23ac6d1[m Add files via upload
[33ma57a429[m Add files via upload
[33mcc123c8[m Add files via upload
[33m1de5ed2[m Add files via upload
[33m8946db4[m Add files via upload
[33mb3cdde2[m Add files via upload
[33ma40d9fd[m Delete parser.js
[33m17ad467[m Add files via upload
[33m1c7fd71[m Add files via upload
[33mf0275ae[m Add files via upload
[33m4517e30[m Add files via upload
[33m8068364[m Add files via upload
[33m126213e[m Add files via upload
[33m032ec63[m Add files via upload
[33m16547b9[m Add files via upload
[33m6bef185[m Update README.md
[33md543cd6[m Add files via upload
[33md15c446[m Add files via upload
[33m27a3d60[m Add files via upload
[33m6fe18e3[m Add files via upload
[33m7195641[m Add files via upload
[33mb1615c8[m Add files via upload
[33mc8ae5ae[m Add files via upload
[33m5a83bc3[m Add files via upload
[33m62931e2[m Add files via upload
[33m4a553f3[m Add files via upload
[33md4b151d[m Add files via upload
[33m7a85df8[m Add files via upload
[33m2aefb18[m Add files via upload
[33m86c593c[m Delete source directory
[33m411540b[m Add files via upload
[33m3537d59[m Add files via upload
[33ma0dd08a[m Delete docs/help directory
[33m751a462[m Add files via upload
[33m7bca8a7[m Delete docs/help directory
[33ma3fa9bc[m Delete LoganBASIC Native Functions.txt
[33m2fc3bc5[m Add files via upload
[33m2a23f4b[m Add files via upload
[33mb609f54[m Add files via upload
[33ma3b86b6[m Add files via upload
[33m2bc02cc[m Add files via upload
[33m726e869[m Add files via upload
[33m57548bd[m Add files via upload
[33m17ad83e[m Add files via upload
[33m90a0442[m Add files via upload
[33m4d695e0[m Add files via upload
[33m80dd059[m Add files via upload
[33m6ebb7f1[m Add files via upload
[33m0471c7a[m Add files via upload
[33m2444ede[m Add files via upload
[33maa54683[m Add files via upload
[33m776161a[m Add files via upload
[33m78d23e2[m Add files via upload
[33m20eca7b[m Add files via upload
[33m4b611ff[m Add files via upload
[33m5492639[m Add files via upload
[33m986d176[m Delete loganbasic.html
[33mc41296c[m Delete loganbasic.css
[33mc12ac65[m Add files via upload
[33mc488c3c[m Delete LoganBASIC TODO.txt
[33m902899d[m Delete LoganBASIC Opcodes.txt
[33md660df4[m Delete LoganBASIC Native Functions.txt
[33m90380ee[m Delete LoganBASIC Grammar.txt
[33m6aa78dc[m Delete LoganBASIC Updates.txt
[33m6acfbc7[m Delete source directory
[33m909177e[m Add files via upload
[33mfc0ad1b[m Add files via upload
[33m2731d56[m Add files via upload
[33m1709043[m Add files via upload
[33mff83abb[m Add files via upload
[33m93709f3[m Add files via upload
[33me524a34[m Add files via upload
[33m8ea6a16[m Add files via upload
[33m6cede24[m Add files via upload
[33mb94e446[m Add files via upload
[33me32168a[m Add files via upload
[33m2ee4ac7[m Add files via upload
[33m7aad119[m Add files via upload
[33m1269281[m Add files via upload
[33m8957018[m Add files via upload
[33mdeecbf2[m Add files via upload
[33m786d24c[m Delete loganbasic_workermsg.js
[33m710bc7d[m Delete loganbasic_ui.js
[33m2bb1995[m Delete loganbasic_token.js
[33m5034875[m Delete loganbasic_main.js
[33mf66083f[m Delete loganbasic_lexer.js
[33m944f284[m Delete loganbasic_interpreter.js
[33m063bfdb[m Delete loganbasic.html
[33mf5a1733[m Delete loganbasic.css
[33m6b0fe6f[m Add files via upload
[33mb8fd93a[m Add files via upload
[33m7d57e6d[m Add files via upload
[33m84fe48f[m Add files via upload
[33m8ee3eb4[m Add files via upload
[33m7ca276e[m Add files via upload
[33m393657d[m Add files via upload
[33m9264c7a[m Add files via upload
[33m8fb00dc[m Add files via upload
[33m9f6c2d3[m Add files via upload
[33mf4d8213[m Add files via upload
[33m37cb521[m Add files via upload
[33m6e7075a[m Add files via upload
[33m088c778[m Initial commit
