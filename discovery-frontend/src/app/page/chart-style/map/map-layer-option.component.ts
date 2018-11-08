/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Component, ElementRef, Injector, Input, ViewChild } from '@angular/core';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { UIMapOption } from '../../../common/component/chart/option/ui-option/map/ui-map-chart';
import {
  MapBy,
  MapLayerType,
  MapSymbolType,
  MapThickness
} from '../../../common/component/chart/option/define/map/map-common';
import * as _ from 'lodash';
import { SymbolType } from '../../../common/component/chart/option/define/common';
import { UISymbolLayer } from '../../../common/component/chart/option/ui-option/map/ui-symbol-layer';
import { MapOutline } from '../../../common/component/chart/option/ui-option/map/ui-outline';
import { UIPolygonLayer } from '../../../common/component/chart/option/ui-option/map/ui-polygon-layer';
import { UILineLayer } from '../../../common/component/chart/option/ui-option/map/ui-line-layer';
import { UIHeatmapLayer } from '../../../common/component/chart/option/ui-option/map/ui-heatmap-layer';
import { UITileLayer } from '../../../common/component/chart/option/ui-option/map/ui-tile-layer';
import { BaseOptionComponent } from '../base-option.component';
import { ColorTemplateComponent } from '../../../common/component/color-picker/color-template.component';
import { Field } from '../../../domain/workbook/configurations/field/field';

@Component({
  selector: 'map-layer-option',
  templateUrl: './map-layer-option.component.html'
})
export class MapLayerOptionComponent extends BaseOptionComponent {

  // current layer index (0-2)
  @Input('index')
  public index: number;

  @Input('uiOption')
  public set setUiOption(uiOption: UIMapOption) {

    this.uiOption = uiOption;
  }

  @Input('pivot')
  public set setPivot(pivot: Pivot) {

    this.pivot = pivot;

    // TODO set color dimension / measure list

    // when dimension is added, set color by as dimension

    // when measure is added, set color by as measure (first measure -> color by)
    // when measure is added, set size by as measure (last measure -> size by )

    this.getColorBy();
    this.getSizeBy();
  }

  // color template popup
  @ViewChild('colorTemplate')
  public colorTemplate: ColorTemplateComponent;

  public uiOption: UIMapOption;

  // pivot data
  public pivot: Pivot;

  public colorColumnList : Field[] = [];

  // symbol layer - type list
  public symbolLayerTypes = [{name : this.translateService.instant('msg.page.layer.map.type.point'), value: MapLayerType.SYMBOL},
                             {name : this.translateService.instant('msg.page.layer.map.type.heatmap'), value: MapLayerType.HEATMAP},
                             {name : this.translateService.instant('msg.page.layer.map.type.tile'), value: MapLayerType.TILE}];

  // symbol layer - symbol list
  public symbolLayerSymbols = [{name : this.translateService.instant('msg.page.layer.map.point.circle'), value : MapSymbolType.CIRCLE},
                               {name : this.translateService.instant('msg.page.layer.map.point.square'), value : MapSymbolType.SQUARE},
                               {name : this.translateService.instant('msg.page.layer.map.point.triangle'), value : MapSymbolType.TRIANGLE},
                               {name : this.translateService.instant('msg.page.layer.map.point.pin'), value : MapSymbolType.PIN},
                               {name : this.translateService.instant('msg.page.layer.map.point.plain'), value : MapSymbolType.PLAIN},
                               {name : this.translateService.instant('msg.page.layer.map.point.people'), value : MapSymbolType.USER}];

  // color - transparency
  public transparencyList = [{name : this.translateService.instant('msg.page.layer.map.color.transparency.none'), value : 0},
                             {name : '20%', value : 20}, {name : '40%', value : 40}, {name : '60%', value : 60},
                             {name : '80%', value : 80}, {name : '100%', value : 100}];

  // outline - thickness
  public thicknessList = [{value : MapThickness.THIN}, {value : MapThickness.NORMAL}, {value : MapThickness.THICK}];


  // line - storke by, symbol - size by
  public byList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE},
                   {name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE}];

  // all layers - color by
  public colorByList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE},
                        {name : this.translateService.instant('msg.page.li.color.dimension'), value : MapBy.DIMENSION},
                        {name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE}];

  // show / hide setting for color picker
  public colorListFlag: boolean = false;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /**
   * all layers - change layer name
   */
  public changeLayerName(name : string) {

    this.uiOption.layers[this.index].name = name;

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * symbol layer - change layer type
   * @param {MapLayerType} layerType
   */
  public changeSymbolLayerType(layerType : MapLayerType) {

    // change layer type
    this.uiOption.layers[this.index].type = layerType;

    // change color type by layer type
    if (MapLayerType.HEATMAP === layerType) {

      this.uiOption.layers[this.index].color.schema = 'HC1';
    } else if (MapLayerType.SYMBOL === layerType) {

      this.uiOption.layers[this.index].color.by = MapBy.NONE;
      this.uiOption.layers[this.index].color.schema = '#6344ad';
    } else if (MapLayerType.TILE === layerType) {

      this.uiOption.layers[this.index].color.by = MapBy.NONE;
      this.uiOption.layers[this.index].color.schema = '#6344ad';
    }

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * symbol layer - change symbol type
   * @param {SymbolType} symbolType
   */
  public changeSymbolType(symbolType: MapSymbolType) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).symbol = symbolType;

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * all layers - change transparency
   * @param {number} transparency
   */
  public changeTransparency(data: Object) {

    this.uiOption.layers[this.index].color.transparency = data['value'];

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * symbol layer - toggle view raw data
   * @param {boolean} viewRawData
   */
  public toggleViewRawData(viewRawData: boolean) {

    this.uiOption.layers[this.index].viewRawData = viewRawData;

    // apply layer ui option
    this.applyLayers({});
  }

  /**
   * symbol, polygon layer - toggle outline
   * @param {MapOutline} outline
   */
  public toggleOutline(outline: MapOutline) {

    if (outline) {
      outline = null;
    } else outline = <any>{color : '#4f4f4f', thickness : MapThickness.NORMAL};

    if (MapLayerType.SYMBOL === this.uiOption.layers[this.index].type) {
      (<UISymbolLayer>this.uiOption.layers[this.index]).outline = outline;

    } else if (MapLayerType.POLYGON === this.uiOption.layers[this.index].type) {
      (<UIPolygonLayer>this.uiOption.layers[this.index]).outline = outline;
    }

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - change thickness
   * @param {MapThickness} thickness
   */
  public changeThick(thickness: MapThickness) {

    if (MapLayerType.SYMBOL === this.uiOption.layers[this.index].type) {
      (<UISymbolLayer>this.uiOption.layers[this.index]).outline.thickness = thickness;

    } else if (MapLayerType.POLYGON === this.uiOption.layers[this.index].type) {
      (<UIPolygonLayer>this.uiOption.layers[this.index]).outline.thickness = thickness;
    }

    this.applyLayers();
  }

  /**
   * all layers - return default transparency index
   * @returns {number}
   */
  public findTransparencyIndex() {
    return _.findIndex(this.transparencyList, {value : this.uiOption.layers[this.index].color.transparency});
  }

  /**
   * line layer - return default stroke by index
   * @returns {number}
   */
  public findStrokeByIndex() {
    return _.findIndex(this.byList, {value : (<UILineLayer>this.uiOption.layers[this.index]).thickness.by});
  }

  /**
   * symbol layer - return default size by index
   * @returns {number}
   */
  public findSymbolSizeByIndex() {
    return _.findIndex(this.byList, {value : (<UISymbolLayer>this.uiOption.layers[this.index]).size.by});
  }

  /**
   * symbol layer - return default size column index
   * @returns {number}
   */
  public findSymbolSizeColumnIndex() {
    return _.findIndex(this.uiOption.fieldMeasureList, {alias : (<UISymbolLayer>this.uiOption.layers[this.index]).size.column});
  }

  /**
   * all layers - return default color by index
   * @returns {number}
   */
  public findColorByIndex() {
    return _.findIndex(this.colorByList, {value : this.uiOption.layers[this.index].color.by});
  }

  /**
   * return default color column index
   * @returns {number}
   */
  public findColorColumnIndex() {
    return _.findIndex(this.colorColumnList, {alias : this.uiOption.layers[this.index].color.column});
  }

  /**
   * all layers - set color by
   * @param {Object} data
   */
  public changeColorBy(data: Object) {

    this.uiOption.layers[this.index].color.by = data['value'];

    // set schema by color type
    if (MapBy.DIMENSION === data['value']) {
      this.uiOption.layers[this.index].color.schema = 'SC1';
    } else if (MapBy.MEASURE === data['value']) {
      this.uiOption.layers[this.index].color.schema = 'VC1';
    } else if (MapBy.NONE === data['value']) {
      this.uiOption.layers[this.index].color.schema = '#6344ad';
    }

    this.applyLayers();
  }

  /**
   *
   * @param {Object} data
   */
  public changeColorColumn(data: Object) {

    this.uiOption.layers[this.index].color.column = data['value'];

    this.applyLayers();
  }

  /**
   * line layer - stroke by
   * @param {Object} data
   */
  public changeStrokeBy(data: Object) {

    (<UILineLayer>this.uiOption.layers[this.index]).thickness.by = data['value'];

    this.applyLayers();
  }

  /**
   * line layer - stroke maxValue
   * @param {number} maxValue
   */
  public changeThickMaxValue(maxValue: number) {

    (<UILineLayer>this.uiOption.layers[this.index]).thickness.maxValue = maxValue;

    this.applyLayers();
  }

  /**
   * symbol layer - change size by
   * @param {Object} data
   */
  public changeSizeBy(data: Object) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).size.by = data['value'];

    this.applyLayers();
  }

  /**
   * symbol layer - change size column
   * @param {Object} data
   */
  public changeSizeColumn(data: Object) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).size.column = data['value'];

    this.applyLayers();
  }

  /**
   * color by none - change color
   * @param {string} colorCode
   */
  public changeByNoneColor(colorCode: string) {

    this.uiOption.layers[this.index].color.schema = colorCode;

    this.applyLayers();
  }

  /**
   * heatmap layer - change blurs
   * @param obj
   * @param slider
   */
  public changeBlur(obj: any, slider: any) {

    (<UIHeatmapLayer>this.uiOption.layers[this.index]).blur = slider.from;

    this.applyLayers();
  }

  /**
   * heatmap layer - change radius
   * @param obj
   * @param slider
   */
  public changeRadius(obj: any, slider: any) {

    (<UIHeatmapLayer>this.uiOption.layers[this.index]).radius = slider.from;

    this.applyLayers();
  }

  /**
   * tile(hexagon) layer - change coverage
   * @param obj
   * @param slider
   */
  public changeCoverage(obj: any, slider: any) {

    (<UITileLayer>this.uiOption.layers[this.index]).coverage = slider.from;

    this.applyLayers();
  }

  /**
   * change color
   * @param data
   */
  public changeColor(data: any) {

    this.uiOption.layers[this.index].color.schema = data.colorNum;

    this.applyLayers();
  }

  /**
   * find same color index in color list (heatmap)
   * @returns {number}
   */
  public findHeatmapColorIndex() {
    if (this.colorTemplate) {
      let obj = _.find(this.colorTemplate.mapHeatmapColorList, {colorNum : this.uiOption.layers[this.index].color.schema});
      if (obj) return obj['index'];
      return 1;
    }
    return 1;
  }

  /**
   * find same color index in color list (dimension)
   * @returns {number}
   */
  public findDimensionColorIndex() {
    if (this.colorTemplate) {
      let obj = _.find(this.colorTemplate.defaultColorList, {colorNum : this.uiOption.layers[this.index].color.schema});
      if (obj) return obj['index'];
      return 1;
    }
    return 1;
  }

  /**
   * find same color index in color list (measure)
   * @returns {any}
   */
  public findMeasureColorIndex() {
    if (this.colorTemplate) {
      let obj = _.find(this.colorTemplate.measureColorList, {colorNum : this.uiOption.layers[this.index].color.schema});

      if (obj) {
        return obj['index'];
      } else {
        return _.find(this.colorTemplate.measureReverseColorList, {colorNum : this.uiOption.layers[this.index].color.schema})['index'];
      }
    }
    return 1;
  }

  /**
   * set color by, column by pivot
   */
  public getColorBy() {

    // TODO pivot (aggregations - measure, columns - dimension => wrong) should be fixed

    // should know order of dimension, measure in pivot

    // set dimension, set measure list
    if (MapBy.DIMENSION === this.uiOption.layers[this.index].color.by) {

      this.colorColumnList = this.uiOption.fielDimensionList;
    } else if (MapBy.MEASURE === this.uiOption.layers[this.index].color.by) {

      this.colorColumnList = this.uiOption.fieldMeasureList;
    }
  }

  /**
   * set size by, column by pivot
   */
  public getSizeBy() {

    // TODO pivot (aggregations - measure, columns - dimension => wrong) should be fixed
    if (this.pivot.aggregations && this.pivot.aggregations.length >= 2 && MapLayerType.SYMBOL === this.uiOption.layers[this.index].type) {

      // set size by as measure when more than two measures, last measure
      let sizeBy = this.pivot.aggregations[this.pivot.aggregations.length - 1];

      (<UISymbolLayer>this.uiOption.layers[this.index]).size.by = MapBy.MEASURE;
      (<UISymbolLayer>this.uiOption.layers[this.index]).size.column = sizeBy.alias;

    } else {
      (<UISymbolLayer>this.uiOption.layers[this.index]).size.by = MapBy.NONE;
    }
  }

  /**
   * apply layer ui option
   * @param {Object} drawChartParam - call api or not
   */
  private applyLayers(drawChartParam?: Object) {

    this.uiOption = <UIMapOption>_.extend({}, this.uiOption, {
      layers: this.uiOption.layers
    });

    this.update(drawChartParam);
  }
}
