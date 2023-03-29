import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { PetFormService, PetFormGroup } from './pet-form.service';
import { IPet } from '../pet.model';
import { PetService } from '../service/pet.service';
import { IOwner } from 'app/entities/owner/owner.model';
import { OwnerService } from 'app/entities/owner/service/owner.service';
import { IBreed } from 'app/entities/breed/breed.model';
import { BreedService } from 'app/entities/breed/service/breed.service';
import { PetType } from 'app/entities/enumerations/pet-type.model';
import { Sex } from 'app/entities/enumerations/sex.model';

@Component({
  selector: 'jhi-pet-update',
  templateUrl: './pet-update.component.html',
})
export class PetUpdateComponent implements OnInit {
  isSaving = false;
  pet: IPet | null = null;
  petTypeValues = Object.keys(PetType);
  sexValues = Object.keys(Sex);

  ownersSharedCollection: IOwner[] = [];
  breedsSharedCollection: IBreed[] = [];

  editForm: PetFormGroup = this.petFormService.createPetFormGroup();

  constructor(
    protected petService: PetService,
    protected petFormService: PetFormService,
    protected ownerService: OwnerService,
    protected breedService: BreedService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareOwner = (o1: IOwner | null, o2: IOwner | null): boolean => this.ownerService.compareOwner(o1, o2);

  compareBreed = (o1: IBreed | null, o2: IBreed | null): boolean => this.breedService.compareBreed(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pet }) => {
      this.pet = pet;
      if (pet) {
        this.updateForm(pet);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const pet = this.petFormService.getPet(this.editForm);
    if (pet.id !== null) {
      this.subscribeToSaveResponse(this.petService.update(pet));
    } else {
      this.subscribeToSaveResponse(this.petService.create(pet));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPet>>): void {
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

  protected updateForm(pet: IPet): void {
    this.pet = pet;
    this.petFormService.resetForm(this.editForm, pet);

    this.ownersSharedCollection = this.ownerService.addOwnerToCollectionIfMissing<IOwner>(this.ownersSharedCollection, pet.owner);
    this.breedsSharedCollection = this.breedService.addBreedToCollectionIfMissing<IBreed>(this.breedsSharedCollection, pet.breed);
  }

  protected loadRelationshipsOptions(): void {
    this.ownerService
      .query()
      .pipe(map((res: HttpResponse<IOwner[]>) => res.body ?? []))
      .pipe(map((owners: IOwner[]) => this.ownerService.addOwnerToCollectionIfMissing<IOwner>(owners, this.pet?.owner)))
      .subscribe((owners: IOwner[]) => (this.ownersSharedCollection = owners));

    this.breedService
      .query()
      .pipe(map((res: HttpResponse<IBreed[]>) => res.body ?? []))
      .pipe(map((breeds: IBreed[]) => this.breedService.addBreedToCollectionIfMissing<IBreed>(breeds, this.pet?.breed)))
      .subscribe((breeds: IBreed[]) => (this.breedsSharedCollection = breeds));
  }
}
