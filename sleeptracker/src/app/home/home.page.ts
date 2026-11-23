import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonDatetime, IonDatetimeButton, IonModal, IonButton, IonSegment, IonSegmentButton, IonNote, ToastController, IonCheckbox, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, chevronBack, chevronForward } from 'ionicons/icons';
import { SleepService } from '../services/sleep.service';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

function toLocalISO(date:Date):string {
  const pad = (n:number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel,
    IonDatetime, IonDatetimeButton, IonModal, IonButton, IonSegment, IonSegmentButton, IonNote,
    IonCheckbox, IonIcon
  ],
})
export class HomePage {
  scaleValues = StanfordSleepinessData.ScaleValues;
  scaleOptions = [1, 2, 3, 4, 5, 6, 7];
  sleepinessShort = ['', 'Wide awake', 'Alert', 'Relaxed', 'A bit foggy', 'Foggy', 'Sleepy', 'Very sleepy'];
  bedtime:string = '';
  wakeTime:string = '';
  sleepinessValue:number | null = null;
  sleepinessTime:string = '';
  weekOffset:number = 0;
  selectedDay:Date = new Date();
  selecting:boolean = false;
  selectedIds = new Set<string>();

  constructor(public sleepService:SleepService, private toastCtrl:ToastController) {
    addIcons({ trashOutline, chevronBack, chevronForward });
    this.resetSleepForm();
    this.resetSleepinessForm();
  }

  ngOnInit() {
    console.log(this.allSleepData);
  }

  get allSleepData() {
    return SleepService.AllSleepData;
  }

  /* Summary  */
  get todayString():string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  get todaySleep():OvernightSleepData | undefined {
    const today = this.sleepsOn(new Date());
    return today[today.length - 1];
  }

  get todaySleepiness():StanfordSleepinessData | undefined {
    return SleepService.AllSleepinessData
      .filter(d => this.sameDay(d.loggedAt, new Date()))
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime())[0];
  }

  /* Tap a tile to scroll to its form */
  scrollTo(id:string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* History */
  get weekDays():{ date:Date, letter:string, face:string, selected:boolean, isToday:boolean }[] {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i - this.weekOffset * 7);
      const sleep = this.sleepsOn(date)[0];
      days.push({
        date,
        letter: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
        face: sleep ? this.sleepFace(sleep) : '',
        selected: this.sameDay(date, this.selectedDay),
        isToday: this.sameDay(date, new Date()),
      });
    }
    return days;
  }

  get weekLabel():string {
    if (this.weekOffset === 0) return 'This week';
    const days = this.weekDays;
    const short = (d:Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return short(days[0].date) + ' – ' + short(days[6].date);
  }

  selectDay(date:Date) {
    this.selectedDay = date;
    this.cancelSelecting();
  }

  changeWeek(step:number) {
    this.weekOffset = Math.max(0, this.weekOffset + step);
    this.selectDay(this.weekDays[6].date);
  }

  private sameDay(a:Date, b:Date):boolean {
    return a.toDateString() === b.toDateString();
  }

  private sleepsOn(date:Date):OvernightSleepData[] {
    return SleepService.AllOvernightData.filter(d => this.sameDay(d.end, date));
  }

  get selectedSleeps():OvernightSleepData[] {
    return this.sleepsOn(this.selectedDay);
  }

  get selectedSleepiness():StanfordSleepinessData[] {
    return SleepService.AllSleepinessData
      .filter(d => this.sameDay(d.loggedAt, this.selectedDay))
      .sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());
  }

  get selectedLabel():string {
    const date = this.selectedDay;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const short = date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + date.getDate();
    if (this.sameDay(date, new Date())) return 'Today, ' + short;
    if (this.sameDay(date, yesterday)) return 'Yesterday, ' + short;
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  sleepTimes(d:OvernightSleepData):string {
    const time = (t:Date) => t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return time(d.start) + ' → ' + time(d.end);
  }

  durationText(d:OvernightSleepData):string {
    const mins = d.durationMinutes();
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  sleepQuality(d:OvernightSleepData):'good' | 'okay' | 'short' {
    const hours = d.durationMinutes() / 60;
    if (hours >= 7) return 'good';
    if (hours >= 6) return 'okay';
    return 'short';
  }

  sleepStatus(d:OvernightSleepData):string {
    const words = { good: 'Enough sleep', okay: 'A little short', short: 'Not enough sleep' };
    return words[this.sleepQuality(d)];
  }

  sleepFace(d:OvernightSleepData):string {
    const faces = { good: '😊', okay: '😐', short: '🥱' };
    return faces[this.sleepQuality(d)];
  }


  /* Overnight sleep */
  resetSleepForm() {
    const bed = new Date();
    bed.setDate(bed.getDate() - 1);
    bed.setHours(23, 0, 0, 0);
    const wake = new Date();
    wake.setHours(7, 0, 0, 0);
    this.bedtime = toLocalISO(bed);
    this.wakeTime = toLocalISO(wake);
  }

  get sleepMinutes():number {
    return Math.round((new Date(this.wakeTime).getTime() - new Date(this.bedtime).getTime()) / 60000);
  }

  get sleepDurationText():string {
    return `${Math.floor(this.sleepMinutes / 60)}h ${this.sleepMinutes % 60}m`;
  }

  /* Already logged a sleep for this wake day (one per day) */
  get sleepAlreadyLogged():boolean {
    return this.sleepsOn(new Date(this.wakeTime)).length > 0;
  }

  get wakeDayText():string {
    return new Date(this.wakeTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /* prevent error */
  get sleepError():string | null {
    if (this.sleepMinutes <= 0) return 'Wake time must be after bedtime.';
    if (this.sleepMinutes > 24 * 60) {
      const wakeDay = new Date(this.wakeTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `Bedtime is more than 24 hours before wake time. If you went to bed after midnight, set the bedtime date to ${wakeDay}.`;
    }
    if (new Date(this.wakeTime).getTime() > Date.now()) return 'Wake time cannot be in the future.';
    return null;
  }

  saveSleep() {
    if (this.sleepError) return;
    const data = new OvernightSleepData(new Date(this.bedtime), new Date(this.wakeTime));
    this.sleepService.logOvernightData(data);
    this.showUndoToast(`Saved ${this.sleepDurationText} of sleep`, data);
    this.weekOffset = 0;
    this.selectedDay = data.end;
    this.resetSleepForm();
  }

  /* Sleepiness */

  resetSleepinessForm() {
    this.sleepinessValue = null;
    this.sleepinessTime = toLocalISO(new Date());
  }

  saveSleepiness() {
    if (this.sleepinessValue === null) return;
    const data = new StanfordSleepinessData(this.sleepinessValue, new Date(this.sleepinessTime));
    this.sleepService.logSleepinessData(data);
    this.showUndoToast(`Logged sleepiness ${this.sleepinessValue}/7`, data);
    this.resetSleepinessForm();
  }

  /* undo button */
  async showUndoToast(message:string, data:SleepData) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 4000,
      position: 'bottom',
      buttons: [{ text: 'Undo', role: 'cancel', handler: () => this.sleepService.deleteData(data) }],
    });
    await toast.present();
  }

  /* Helpers */

  isSleep(d:SleepData):d is OvernightSleepData {
    return d instanceof OvernightSleepData;
  }

  timeString(d:SleepData):string {
    return d.loggedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  /* Delete selected logs */
  startSelecting() {
    this.selecting = true;
  }

  cancelSelecting() {
    this.selecting = false;
    this.selectedIds.clear();
  }

  toggleSelected(d:SleepData) {
    if (this.selectedIds.has(d.id)) {
      this.selectedIds.delete(d.id);
    } else {
      this.selectedIds.add(d.id);
    }
  }

  async deleteSelected() {
    const removed = SleepService.AllSleepData
      .map((d, index) => ({ d, index }))
      .filter(item => this.selectedIds.has(item.d.id));
    removed.forEach(item => this.sleepService.deleteData(item.d));
    this.cancelSelecting();

    const toast = await this.toastCtrl.create({
      message: `Deleted ${removed.length} log${removed.length > 1 ? 's' : ''}`,
      duration: 4000,
      position: 'bottom',
      buttons: [{ text: 'Undo', role: 'cancel', handler: () => {
        removed.forEach(item => this.sleepService.restoreData(item.d, item.index));
      }}],
    });
    await toast.present();
  }
}