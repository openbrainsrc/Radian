---
layout: default
title: Reference manual - Mlack
---

## Mlack

### User interface 1

~~~~ {.html}
<plot-grid tabs>
  <plot title="Time series">
    ...
  <plot title="Trajectories">
    ...
~~~~

could become something like:

~~~~ {.html}
<div>
  <div ng-show="...">
    <span .form-inline>
      <span .btn-group data-toggle="buttons-radio">
        <button ng-repeat="panel in bhUI.panels" #{{panel.id}} .btn
                ng-click="bhUI.activePanel={{\$index}}">
          {{panel.label}}
    ...
    <div ng-show="bhUI.activePanel==0">
      ...
    <div ng-show="bhUI.activePanel==1">
      ...
    <div ng-show="bhUI.activePanel==2">
      ...
~~~~

### User interface 2

* User interface attributes that appear on individual `<plot>`
  directives apply only to those plots.

* User interface attributes that appear on `<plot-grid>` attributes
  apply to all plots contained within the grid.

* Plot elements search up through the DOM as far as the highest
  enclosing `<plot-grid>` element looking for relevant UI elements.

* Changes in UI configuration are communicated to containing plots via
  `scope.\$broadcast`, using a custom cancellation mechanism to
  prevent elements lower down the containment tree from handling UI
  events that have already been processed higher up the tree.
