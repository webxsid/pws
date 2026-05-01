import { Component } from "@angular/core";

import { ManagerApiService } from "../../core/services/manager-api.service";

@Component({
  selector: "pws-overview-page",
  templateUrl: "./overview-page.component.html",
  styleUrl: "./overview-page.component.css"
})
export class OverviewPageComponent {
  protected readonly snapshot;

  constructor(private readonly managerApi: ManagerApiService) {
    this.snapshot = this.managerApi.getSnapshot();
  }
}
