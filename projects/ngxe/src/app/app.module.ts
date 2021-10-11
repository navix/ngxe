import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { PlaceholdersValidatorDirective } from './placeholders/placeholders-validator.directive';
import { TableComponent } from './table/table.component';
import { FileComponent } from './file/file.component';
import { FileHolderDirective } from './file/file-holder.directive';

@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    PlaceholdersValidatorDirective,
    FileComponent,
    FileHolderDirective,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
