---
layout: default
title: Radian Gallery
---

<div id="gallery" ng-controller="GalleryCtrl">
  <div class="navbar navbar-gallery">
    <div class="navbar-inner">
      <ul class="nav" ng-repeat="g in egs">
        <li class="dropdown">
          <a class="dropdown-toggle" data-toggle="dropdown" href="#">
            {{g.title}}
            <b class="caret"></b>
          </a>
          <ul class="dropdown-menu">
            <li tabindex="-1" href="#" ng-repeat="eg in g.items">
              <a href={{eg.link}}>{{eg.title}}</a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>

  <ng-view></ng-view>
</div>
