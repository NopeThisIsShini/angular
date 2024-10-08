import { Inject, Injectable } from '@angular/core';
import { RoomList } from '../models/room';
import { APP_SERVICE_CONFIG } from '../../../AppConfig/appconfig.service';
import { AppConfig } from '../../../AppConfig/appconfig.interface';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  // this is userful where we are calling same api multiple time it returns only 1 

  // here this $ tells that it returns a stream of data and getRoom is a property of this class
  getRooms$ = this.http.get<RoomList[]>('/api/rooms').pipe(
    // rxjs operator ShareReplay 
    shareReplay(1)
  );
              // value injector 
  constructor(
    @Inject(APP_SERVICE_CONFIG) private config: AppConfig,
    private http: HttpClient
  ) 
  {
    console.log(this.config.apiEndpoint);
   }
   getRooms(){
    return this.http.get<RoomList[]>('/api/rooms');
   }
   editRoom(room: RoomList) {
     return this.http.put<RoomList[]>(`${this.config.apiEndpoint}/rooms/${room.roomNumber}`, room);
   }
  // local database
  
  // roomList : RoomList[] = [
  //   {
  //     roomNumber: 1,
  //     roomType: 'Deluxe Room',
  //     amenities: 'Air Conditioner , Free Wi-Fi, TV, Bathroom, Kitchen',
  //     price: 600,
  //     chekInTime: new Date('25-Jul-2024'),
  //     checkOutTime: new Date('26-Jul-2024')
  //   },
  //   {
  //     roomNumber: 2,
  //     roomType: 'Normal Room',
  //     amenities: 'Free Wi-Fi, TV, Bathroom, Kitchen',
  //     price: 400,
  //     chekInTime: new Date('23-Jul-2024'),
  //     checkOutTime: new Date('27-Jul-2024')
  //   },
  //   {
  //     roomNumber: 3,
  //     roomType: 'Deluxe Room',
  //     amenities: 'Air Conditioner , Free Wi-Fi, TV, Bathroom, Kitchen',
  //     price: 700,
  //     chekInTime: new Date('22-Jul-2024'),
  //     checkOutTime: new Date('24-Jul-2024')
  //   },
  //   {
  //     roomNumber: 5,
  //     roomType: 'Deluxe Room',
  //     amenities: 'Air Conditioner , Free Wi-Fi, TV, Bathroom, Kitchen',
  //     price: 600,
  //     chekInTime: new Date('25-Jul-2024'),
  //     checkOutTime: new Date('26-Jul-2024')
  //   },
  //   {
  //     roomNumber: 7,
  //     roomType: 'Normal Room',
  //     amenities: 'Air Conditioner , Free Wi-Fi, TV, Bathroom, Kitchen',
  //     price: 600,
  //     chekInTime: new Date('25-Jul-2024'),
  //     checkOutTime: new Date('26-Jul-2024')
  //   },
  // ];
  // getRooms(){
  //   return this.roomList;
  // }

}
