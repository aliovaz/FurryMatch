import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { OwnerComponent } from './list/owner.component';
import { OwnerDetailComponent } from './detail/owner-detail.component';
import { OwnerUpdateComponent } from './update/owner-update.component';
import { OwnerDeleteDialogComponent } from './delete/owner-delete-dialog.component';
import { OwnerRoutingModule } from './route/owner-routing.module';
import { HttpClientModule } from '@angular/common/http';

//Ngx lib dropzone
import { NgxDropzoneModule } from 'ngx-dropzone';

@NgModule({
  imports: [SharedModule, OwnerRoutingModule, HttpClientModule, NgxDropzoneModule],
  declarations: [OwnerComponent, OwnerDetailComponent, OwnerUpdateComponent, OwnerDeleteDialogComponent],
})
export class OwnerModule {}
