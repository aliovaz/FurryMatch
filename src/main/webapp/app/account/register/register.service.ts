import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Registration } from './register.model';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  uploadImage(vals: any): Observable<any> {
    let data = vals;
    return this.http.post('https://api.cloudinary.com/v1_1/alocortesu/image/upload', data);
  }

  getProvinces() {
    return this.http.get('https://ubicaciones.paginasweb.cr/provincias.json');
  }

  getCantones(provinceId: number) {
    return this.http.get(`https://ubicaciones.paginasweb.cr/provincia/${provinceId}/cantones.json`);
  }

  getDistricts(provinceId: number | null, cantonId: number) {
    return this.http.get(`https://ubicaciones.paginasweb.cr/provincia/${provinceId}/canton/${cantonId}/distritos.json`);
  }

  save(registration: Registration): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/register'), registration);
  }
}
