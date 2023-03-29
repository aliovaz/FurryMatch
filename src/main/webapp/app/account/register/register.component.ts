import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';

import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/config/error.constants';
import { RegisterService } from './register.service';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'jhi-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [RegisterService],
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('login', { static: false })
  login?: ElementRef;

  files: File[] = [];

  doNotMatch = false;
  error = false;
  errorEmailExists = false;
  errorUserExists = false;
  success = false;

  selectedProvinceId: number | null = null;
  selectedCantonId: number | null = null;
  provinces: any;
  cantones: any;
  districts: any;

  registerForm = new FormGroup({
    login: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    firstName: new FormControl('', {
      nonNullable: true,
    }),
    secondName: new FormControl('', {}),
    firstLastName: new FormControl('', {
      nonNullable: true,
    }),
    secondLastName: new FormControl('', {
      nonNullable: true,
    }),
    phoneNumber: new FormControl('', {
      nonNullable: true,
    }),
    identityNumber: new FormControl('', {
      nonNullable: true,
    }),
    address: new FormControl('', {
      nonNullable: true,
    }),
    province: new FormControl('', {
      nonNullable: true,
    }),
    canton: new FormControl('', {
      nonNullable: true,
    }),
    district: new FormControl('', {
      nonNullable: true,
    }),
  });

  constructor(private translateService: TranslateService, private registerService: RegisterService) {}

  ngAfterViewInit(): void {
    if (this.login) {
      this.login.nativeElement.focus();
    }
  }

  ngOnInit(): void {
    this.registerService.getProvinces().subscribe((response: any) => {
      const provincesArray = Object.entries(response).map(([id, name]) => ({ id, name }));
      this.provinces = provincesArray;
      console.log(provincesArray);
    });
  }

  selected = '';

  update(e: any) {
    this.selected = e.target.value;
  }

  updateProvince(e: any) {
    const selectedProvinceId = parseInt(e.target.value);
    if (selectedProvinceId) {
      this.selectedProvinceId = selectedProvinceId;
      this.getCantones(selectedProvinceId);
    } else {
      this.selectedProvinceId = null;
      this.selectedCantonId = null;
      this.cantones = null;
      this.districts = null;
    }
  }

  updateCanton(e: any) {
    const selectedCantonId = parseInt(e.target.value);
    if (selectedCantonId) {
      this.selectedCantonId = selectedCantonId;
      this.getDistricts(this.selectedProvinceId, selectedCantonId);
    } else {
      this.selectedCantonId = null;
      this.districts = null;
    }
  }

  getCantones(provinceId: number) {
    this.registerService.getCantones(provinceId).subscribe((response: any) => {
      const cantonesArray = Object.entries(response).map(([id, name]) => ({ id: parseInt(id), name }));
      this.cantones = cantonesArray;
    });
  }

  getDistricts(provinceId: number | null, cantonId: number) {
    this.registerService.getDistricts(provinceId, cantonId).subscribe((response: any) => {
      const districtsArray = Object.entries(response).map(([id, name]) => ({ id: parseInt(id), name }));
      this.districts = districtsArray;
    });
  }

  onSelect(event?: any) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event?: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  onUpload() {
    if (!this.files[0])
      Swal.fire({
        title: 'Error',
        text: 'Debés primero arrastrar o seleccionar una imagen.',
        type: 'error',
        icon: 'error',
        confirmButtonColor: '#3381f6',
        confirmButtonText: 'Cerrar',
      });

    const file_data = this.files[0];
    const data = new FormData();
    data.append('file', file_data);
    data.append('upload_preset', 'furry_match');
    data.append('cloud_name', 'alocortesu');

    this.registerService.uploadImage(data).subscribe(response => {
      if (response) {
        const secureUrl = response.secure_url;
        this.photo.setValue(secureUrl);
        Swal.fire({
          title: 'Fotografía agregada',
          text: 'Continuá registrando tus datos.',
          type: 'success',
          icon: 'success',
          confirmButtonColor: '#3381f6',
          confirmButtonText: 'Cerrar',
        });
      }
    });
  }

  photo: FormControl = new FormControl('');
  firstName: any;
  firstLastName: any;
  district: any;
  canton: any;
  province: any;
  address: any;
  phoneNumber: any;
  identityNumber: any;
  secondLastName: any;

  register(): void {
    this.doNotMatch = false;
    this.error = false;
    this.errorEmailExists = false;
    this.errorUserExists = false;

    const photoValue = this.photo.value;
    const { password, confirmPassword } = this.registerForm.getRawValue();
    const { firstName, secondName, firstLastName, secondLastName, phoneNumber, identityNumber, address, province, canton, district } =
      this.registerForm.controls;
    if (password !== confirmPassword) {
      this.doNotMatch = true;
    } else {
      const { login, email } = this.registerForm.getRawValue();
      this.registerService
        .save({
          login,
          email,
          password,
          langKey: this.translateService.currentLang,
          firstName: firstName.value,
          secondName: secondName.value ? secondName.value : '',
          firstLastName: firstLastName.value,
          secondLastName: secondLastName.value,
          phoneNumber: parseInt(phoneNumber.value, 10),
          photo: photoValue,
          identityNumber: identityNumber.value,
          address: address.value,
          province: province.value,
          canton: canton.value,
          district: district.value,
        })
        .subscribe({
          next: () => (
            Swal.fire({
              title: 'Registro exitoso',
              text: 'Ya sos parte de FurryMatch',
              type: 'success',
              icon: 'success',
              confirmButtonColor: '#3381f6',
              confirmButtonText: 'Cerrar',
            }),
            (this.success = true)
          ),
          error: response => this.processError(response),
        });
    }
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === LOGIN_ALREADY_USED_TYPE) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre de usuario ya existe. Por favor elegí otro.',
        type: 'error',
        icon: 'error',
        confirmButtonColor: '#3381f6',
        confirmButtonText: 'Cerrar',
      });
      this.errorUserExists = true;
    } else if (response.status === 400 && response.error.type === EMAIL_ALREADY_USED_TYPE) {
      Swal.fire({
        title: 'Error',
        text: 'Correo electrónico ya registrado. Por favor intentá con otro.',
        type: 'error',
        icon: 'error',
        confirmButtonColor: '#3381f6',
        confirmButtonText: 'Cerrar',
      });
      this.errorEmailExists = true;
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Registro fallido, intentalo más tarde.',
        type: 'error',
        icon: 'error',
        confirmButtonColor: '#3381f6',
        confirmButtonText: 'Cerrar',
      });
      this.error = true;
    }
  }
}
