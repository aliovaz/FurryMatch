import { Component, OnInit, ElementRef, NgIterable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { OwnerFormService, OwnerFormGroup } from './owner-form.service';
import { IOwner } from '../owner.model';
import { OwnerService } from '../service/owner.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'jhi-owner-update',
  templateUrl: './owner-update.component.html',
  styleUrls: ['./owner-update.component.css'],
  providers: [OwnerService],
})
export class OwnerUpdateComponent implements OnInit {
  isSaving = false;
  owner: IOwner | null = null;

  usersSharedCollection: IUser[] = [];

  editForm: OwnerFormGroup = this.ownerFormService.createOwnerFormGroup();
  files: File[] = [];

  selectedProvinceId: number | null = null;
  selectedCantonId: number | null = null;
  provinces: any;
  cantones: any;
  districts: any;

  constructor(
    protected ownerService: OwnerService,
    protected ownerFormService: OwnerFormService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.ownerService.getProvinces().subscribe((response: any) => {
      const provincesArray = Object.entries(response).map(([id, name]) => ({ id, name }));
      this.provinces = provincesArray;
    });

    this.activatedRoute.data.subscribe(({ owner }) => {
      this.owner = owner;
      if (owner) {
        this.updateForm(owner);
      }

      this.loadRelationshipsOptions();
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
    this.ownerService.getCantones(provinceId).subscribe((response: any) => {
      const cantonesArray = Object.entries(response).map(([id, name]) => ({ id: parseInt(id), name }));
      this.cantones = cantonesArray;
    });
  }

  getDistricts(provinceId: number | null, cantonId: number) {
    this.ownerService.getDistricts(provinceId, cantonId).subscribe((response: any) => {
      const districtsArray = Object.entries(response).map(([id, name]) => ({ id: parseInt(id), name }));
      this.districts = districtsArray;
    });
  }

  previousState(): void {
    window.history.back();
  }

  onSelect(event?: any) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event?: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  photo: FormControl<IOwner['photo']> = new FormControl<IOwner['photo']>(null);

  onUpload() {
    if (!this.files[0]) alert('Debés primero arrastrar o seleccionar una imagen');

    const file_data = this.files[0];
    const data = new FormData();
    data.append('file', file_data);
    data.append('upload_preset', 'furry_match');
    data.append('cloud_name', 'alocortesu');

    this.ownerService.uploadImage(data).subscribe(response => {
      if (response) {
        const secureUrl = response.secure_url;
        this.photo.setValue(secureUrl);
      }
    });
  }

  save(): void {
    this.isSaving = true;
    const owner = this.ownerFormService.getOwner(this.editForm);
    if (owner.id !== null) {
      owner.photo = this.photo.value;
      this.subscribeToSaveResponse(this.ownerService.update(owner));
    } else {
      owner.photo = this.photo.value;
      this.subscribeToSaveResponse(this.ownerService.create(owner));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IOwner>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(owner: IOwner): void {
    this.owner = owner;
    this.ownerFormService.resetForm(this.editForm, owner);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, owner.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.owner?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
