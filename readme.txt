--Readme document for *Yu-Ching Ger*, *yuchingg@uci.edu*, *71948271*--

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

*/10
- 1/1 The ability to log overnight sleep
- 1/1 The ability to log sleepiness during the day
- 1/1 The ability to view these two categories of logged data
- 2/2 Either using a native device resource or backing up logged data
- 2/2 Following good principles of mobile design
- 1.5/2 Creating a compelling app
- 1/1 A readme and demo video which explains how these features were implemented and their design rationale

2. How long, in hours, did it take you to complete this assignment?
12 - 15 hours


3. What online resources did you consult when completing this assignment? (list specific URLs)
Ionic components: https://ionicframework.com/docs/components
Ionic datetime: https://ionicframework.com/docs/api/datetime
Ionic list: https://ionicframework.com/docs/api/list
Ionic colors: https://ionicframework.com/docs/theming/colors
Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines
Stanford Sleepiness Scale: https://web.stanford.edu/~dement/sss.html
I also used Claude to help me plan the app, debug code, and discuss some design ideas. I reviewed, tested, and made changes to the code myself.


4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?
none


5. Is there anything special we need to know in order to run your code?
nope


--Aim for no more than two sentences for each of the following questions.--


6. Did you design your app with a particular type of user in mind? If so, whom?
I designed it for college students who often go to bed late, sometimes after midnight, and want to log their sleep quickly in the morning before class. Also, some might feel sleepy at different times of the day, so maybe need to log sleepiness more than once.


7. Did you design your app specifically for iOS or Android, or both?
I designed it for iOS, since I use an iPhone, and set Ionic to always use iOS mode.


8. How can a person log overnight sleep in your app? Why did you choose to support logging overnight sleep in this way?
Users can log their sleep by selecting their bedtime and wake-up time in the Log your sleep section. I design it like this so that users can quickly adjust the times and see how many hours they slept before saving.

9. How can a person log sleepiness during the day in your app? Why did you choose to support logging sleepiness in this way?
Users can select a number from 1 to 7 based on the Stanford Sleepiness Scale, and the app shows a description of their selected level. I design it like this because tapping a number is faster than reading through words.


10. How can a person view the data they logged in your app? Why did you choose to support viewing logged data in this way?
Users can see their most recent sleep and sleepiness information at the top of the screen, and the history section uses different emojis to show how much they slept each day. They can also tap on a day to see more details or switch between weeks, which makes it easier to understand their sleeping patterns.


11. Which feature choose--using a native device resource, backing up logged data, or both?
Backing up logged data


12. If you used a native device resource, what feature did you add? How does this feature change the app's experience for a user?
I did not use a native device resource.


13. If you backed up logged data, where does it back up to?
I used Capacitor Preferences to save the sleep and sleepiness logs locally on the device, and it uses localStorage when running in a browser. The data is automatically saved so information is still there when they reopen the app.

14. How does your app implement or follow principles of good mobile design?
I tried to make the app simple and easy to use, so i put today's sleep and sleepiness information at the top, so users can quickly see what they have logged and what is missing. I also added an Undo option for saving and deleting logs, used date pickers and warnings to prevent mistakes, and followed iOS design conventions, and consistent colors like blue for sleep, yellow for sleepiness, and emojis to show sleep patterns.