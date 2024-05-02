import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import { AppComponent } from './app.component';
import { PlaceholdersValidatorDirective } from './placeholders/placeholders-validator.directive';
import {RootComponent} from './root/root.component';
import { TableComponent } from './table/table.component';
import { FileComponent } from './file/file.component';
import { FileHolderDirective } from './file/file-holder.directive';

@NgModule({
  declarations: [
    RootComponent,
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
    RouterModule.forRoot([
      {
        path: '',
        component: AppComponent,
      }
    ])
  ],
  providers: [],
  bootstrap: [RootComponent],
})
export class AppModule {
}
