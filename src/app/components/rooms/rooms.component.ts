import { Component, OnInit } from '@angular/core';
import { RoomService } from './services/room.service';
import { RoomList } from './models/room';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})

export class RoomsComponent implements OnInit {
  roomlist: RoomList[] = []
  selectedRoom!: RoomList
  // used to understand ngonchanges
  title: string = 'Room list';
  // observable practice 
  stream = new Observable(observer => {
    // internally obsservable user observer which observe
    // the data if there new data available

    // rxjs works on push architecture, so it will push data in stream if any new arrived

    observer.next('user1');
    observer.next('user2');
    observer.complete();
    // observer.error('error');
  })

  // a property which is changed using viewchild and viewafterInit
  view: string = 'this is before change view'
  onToggle() {
    this.title = 'Rooms list'
  }
  constructor(private roomServ: RoomService) {
    // here just to see usecase of shareReplay i write this
    this.roomServ.getRooms$.subscribe({
      next: (rooms) => {
        console.log('Data:', rooms);
        this.roomlist = rooms
      },

    });
  }
  ngOnInit(): void {
    this.roomServ.getRooms$.subscribe({
      next: (rooms) => {
        console.log('Data:', rooms);
        this.roomlist = rooms
      },

    });
    this.stream.subscribe({
      next: (data) => console.log(data),
      complete: () => console.log('completed'),
      error: (error) => console.log(error)
    })
    // for local db 
    // this.roomlist=this.roomServ.getRooms();
  }
  selectRoom(room: RoomList) {
    console.log(room);
    this.selectedRoom = room
  }
  // add room static data
  addRoom() {
    const room: RoomList = {
      roomNumber: '7',
      roomType: 'Delux',
      price: 2000,
      amenities: 'AC, WiFi, TV',
      chekInTime: new Date('2022-11-02'),
      checkOutTime: new Date('2022-11-03')
    }
    // this means everytime it's returns a new intance with old ones
    this.roomlist = [...this.roomlist, room]
  }
  // this.roomlist.push(room);
  // editroom
  editRoom(){
    const room: RoomList = {
      roomNumber: '3',
      roomType: 'Delux',
      price: 2000,
      amenities: 'AC, WiFi, TV',
      chekInTime: new Date('2022-11-02'),
      checkOutTime: new Date('2022-11-03'),
    };
    this.roomServ.editRoom(room).subscribe((data) =>{
      this.roomlist = data
    })
  }
}
