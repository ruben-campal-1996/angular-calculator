import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../shared/header-component/header-component";
import { Calculator } from "../../../../shared/components/calculator/calculator";
import { Conversor } from "../../../../shared/components/conversor/conversor";

@Component({
  selector: 'app-home-view',
  imports: [Calculator, Conversor],
  templateUrl: './home-view.html',
  host: {
    class:
      'flex flex-1 flex-col items-center gap-6 px-4 py-6 md:flex-row md:flex-wrap md:justify-center',
  },
})
export class HomeView {}
