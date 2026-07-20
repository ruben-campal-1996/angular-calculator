import { Component } from '@angular/core';
import { HeaderComponent } from "../../../../shared/header-component/header-component";
import { Calculator } from "../../../../shared/components/calculator/calculator";
import { Conversor } from "../conversor/conversor";

@Component({
  selector: 'app-home-view',
  imports: [Calculator, Conversor],
  templateUrl: './home-view.html',
  styleUrl: './home-view.css',
})
export class HomeView {}
