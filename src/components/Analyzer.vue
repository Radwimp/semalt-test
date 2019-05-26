<template>
  <div>
    <v-progress-circular
      v-if="isLoading"
      :size="90"
      :width="9"
      color="green"
      class="loader"
      indeterminate
    ></v-progress-circular>
    <div v-if="!isLoading" class="container">
      <div class="subheader">
        <div>Opportunities</div>
        <div>Approximate savings</div>
      </div>
      <v-expansion-panel>
        <v-expansion-panel-content
          v-for="(item, i) in opportunityAudits"
          :key="i"
        >
          <template v-slot:header>
            <div class="audit-title">
              {{item.title}}
              <div :style="{
              color: getColor(item.score),
              width: '50%',
              paddingRight: '10px'}">
                {{(item.details.overallSavingsMs / 1000).toFixed(2)}} s
                <v-progress-linear
                  buffer
                  :buffer-value="getScore(item.score)"
                  :background-color="getColor(item.score)"
                  style="background: lightgrey"
                  height="5"
                  value="30"
                ></v-progress-linear>
              </div>
            </div>
          </template>
          <v-card>
            <v-card-text>
              {{getDescription(item.description)}}
              <a :href="getLink(item.description)">Learn more</a>
              <v-data-table
                :headers="getHeaders(item.details)"
                :items="item.details.items"
                class="elevation-1"
                hide-actions
              >
                <template v-slot:items="props">
                  <td>{{ props.item.url }}</td>
                  <td class="text-xs-right">{{ props.item.totalBytes }}</td>
                  <td class="text-xs-right">{{ props.item.wastedMs || props.item.wastedBytes }}</td>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <div class="subheader">
        <div>Diagnostics</div>
      </div>
      <v-expansion-panel>
        <v-expansion-panel-content
          v-for="(item, i) in diagnosticAudits"
          :key="i"
        >
          <template v-slot:header>
            <div>{{item.title}}</div>
            <div :style="{color: getColor(item.score)}">{{item.displayValue}}</div>
          </template>
          <v-card>
            <v-card-text>
              {{getDescription(item.description)}}
              <a :href="getLink(item.description)">Learn more</a>
              <v-data-table
                :headers="getHeaders(item.details)"
                :items="item.details.items"
                class="elevation-1"
                hide-actions
              >
                <template v-slot:items="props">
                  <td>{{ props.item.url }}</td>
                  <td class="text-xs-right">{{ props.item.totalBytes }}</td>
                  <td class="text-xs-right">{{ props.item.wastedMs || props.item.wastedBytes }}</td>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <div class="subheader">
        <div>Successful audits</div>
      </div>
      <v-expansion-panel>
        <v-expansion-panel-content
          v-for="(item, i) in passedAudits"
          :key="i"
        >
          <template v-slot:header>
            <div>{{item.title}}</div>
          </template>
          <v-card>
            <v-card-text>
              {{getDescription(item.description)}}
              <a :href="getLink(item.description)">Learn more</a>
              <v-data-table
                :headers="getHeaders(item.details)"
                :items="item.details.items"
                class="elevation-1"
                hide-actions
              >
                <template v-slot:items="props">
                  <td>{{ props.item.url }}</td>
                  <td class="text-xs-right">{{ props.item.totalBytes }}</td>
                  <td class="text-xs-right">{{ props.item.wastedMs || props.item.wastedBytes }}</td>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </div>
  </div>
</template>

<script>
import { showAsPassed, getWastedMs } from '@/helpers';

/* eslint-disable no-console */
export default {
  name: 'Analyzer',
  data() {
    return {
      audits: '',
      results: '',
      isLoading: true,
    };
  },
  computed: {
    opportunityAudits() {
      return this.audits
        .filter(audit => audit.group === 'load-opportunities' && !showAsPassed(this.results[audit.id]))
        .sort((auditA, auditB) => getWastedMs(auditB) - getWastedMs(auditA))
        .map(audit => this.results[audit.id]);
    },
    diagnosticAudits() {
      return this.audits
        .filter(audit => audit.group === 'diagnostics' && showAsPassed(this.results[audit.id]))
        .sort((a, b) => {
          const scoreA = this.results[a.id].scoreDisplayMode === 'informative' ? 100 : Number(this.results[a.id].score);
          const scoreB = this.results[b.id].scoreDisplayMode === 'informative' ? 100 : Number(this.results[b.id].score);
          return scoreA - scoreB;
        })
        .map(audit => this.results[audit.id]);
    },
    passedAudits() {
      return this.audits
        .filter(audit => (audit.group === 'load-opportunities' || audit.group === 'diagnostics') &&
          showAsPassed(this.results[audit.id]))
        .map(audit => this.results[audit.id]);
    },
  },
  methods: {
    getColor: score => (score < 0.5 ? 'red' : '#ff9d00'),
    getScore: score => ((1 - score) * 100),
    getDescription: str => (str.split('[Learn more]')[0]),
    getLink: (str) => {
      if (str.indexOf('[Learn more]') === -1) {
        return '';
      }
      return str.split('[Learn more]')[1].slice(1, -2);
    },
    getHeaders: (details) => {
      const res = [];
      details.headings.forEach((header) => {
        if (header.valueType !== 'thumbnail') {
          res.push({ text: header.label, value: header.key });
        }
      });
      return res;
    },
  },
  created() {
    fetch('https://www.googleapis.com/pagespeedonline/v5/runPagespeed/?url=https://semalt.com/')
      .then((response) => {
        if (response.status !== 200) {
          console.log(response.status);
          return;
        }
        response.json().then((data) => {
          this.audits = data.lighthouseResult.categories.performance.auditRefs;
          this.results = data.lighthouseResult.audits;
          this.isLoading = false;
        });
      })
      .catch((err) => {
        console.log('Fetch Error :-S', err);
      });
  },
};
</script>

<style scoped>
  .container {
    width: 50%;
  }
  .subheader {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: #f3f3f3;
    font-size: 16px;
    font-weight: bold;
  }
  .audit-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .loader {
    margin-top: 250px;
  }
</style>
