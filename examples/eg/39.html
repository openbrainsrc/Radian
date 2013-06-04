<h3>Example 39 (Wealth & Health of Nations)</h3>

<div class="form-inline">
  <label>Year ({{year}})</label>
  <input type="range" min=1800 max=2009 step=1
         ng-model="year" ng-init="year=1800">
</div>
<br>

<plot-data name="nat" format="json" src="/data/nations.json">
</plot-data>

<plot height=500 stroke="black" stroke-width=1
      gdp="[[nat#income.map(function(d){return fillIn(d,1800,2009);}))]]"
      life="[[nat#lifeExpectancy.map(function(d){return fillIn(d,1800,2009);}))]]"
      pop="[[nat#population.map(function(d){return fillIn(d,1800,2009);}))]]"
      region="[[nat#region]]" yidx="[[year-1800]]"
      range-x="300,100000" range-y="10,90"
      popint="[[interpolate(pop,[1,1000],'sqrt')]]"
      axis-x-label="Per capita GDP" axis-x-transform="log"
      axis-x-format=",.0d" axis-x-ticks=10
      axis-y-label="Life expectancy">
  <points x="[[gdp.map(function(d) { return d[yidx]; })]]"
          y="[[life.map(function(d) { return d[yidx]; })]]"
          fill="[[category10(region)]]"
          marker-size="[[popint(pop.map(function(d) { return d[yidx]; }))]])">
  </points>
</plot>
