import { NgModule } from '@angular/core';

import {
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    MatToolbarModule,
    MatGridListModule,
    MatFormFieldModule,
    MatProgressBarModule
} from '@angular/material';

@NgModule({
    imports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatToolbarModule,
        MatGridListModule,
        MatFormFieldModule,
        MatProgressBarModule
    ],
    exports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatToolbarModule,
        MatGridListModule,
        MatFormFieldModule,
        MatProgressBarModule
    ]
})
export class MaterialModule { }
