## Statsig React Client SDK

[![npm version](https://badge.fury.io/js/statsig-react.svg)](https://badge.fury.io/js/statsig-react)

> 🚧 This is the Linkree fork of `statsig-react` lib 🚧
>
> The main goal of this fork is to provide lazy loading approach for loading statsig-js js bundle
>
> #### How to use it?
>
> At first, you need to import `StatsigLazyProvider`
>
> ```tsx
>  import { StatsigLazyProvider } from '@linktr.ee/statsig-react/StatsigLazyProvider'
>
>  <StatsigLazyProvider
>    sdkKey={`client-${STATSIG_CLIENT_SECRET}`}
>    stage={STAGE}
>    user={{ userID: account.uuid, privateAttributes: { email: account.emailAddress } }}
>  >
> ```
>
> Then you can use all official hooks from the docs in the children components. For example:
>
> ```tsx
> import { useExperiment } from '@linktr.ee/statsig-react/useExperiment';
>
> const { loading, config } = useExperiment('footer_cta_button');
> ```
>
> Additionally, we added the improved useExperiment where you can pass the default value in order to have more strict types
>
> ```tsx
> import { useExperimentValue } from '@linktr.ee/statsig-react/useExperimentValue';
>
> const { loading, value } = useExperimentValue(
>   'footer_cta_button',
>   'variation',
>   'control',
> );
> ```
> About fork architecture, local development and others, please see the [Fork Development section](#Fork-Development-Guide)

The Statsig React SDK for single user client environments. If you need a SDK for another language or server environment, check out our [other SDKs](https://docs.statsig.com/#sdks).

Statsig helps you move faster with feature gates (feature flags), and/or dynamic configs. It also allows you to run A/B/n tests to validate your new features and understand their impact on your KPIs. If you're new to Statsig, check out our product and create an account at [statsig.com](https://www.statsig.com).

## Getting Started

Check out our [SDK docs](https://docs.statsig.com/client/reactSDK) to get started.

> 🚧 This is the Linkree fork of `statsig-react` lib. This development guide contains specifics which are not related to the official statsig react sdk 🚧

### Fork Development Guide

#### Architecture

(contains only fork changes)




#### Local development 

We're planning to add support of `yarn link`, but right now you can publish a new `alfa` version from your local PC.
At first, you need to compile it and then publish:
 - `npm run prepare`
 - `npm run publish-custom-version`

**_Please make sure that you change the version in the package.json to the alfa -for example - 1.34.0-alpha.96_**

#### Test amd Styleguide

 - `npm test` for unit testing
 - `npm run styleguide` for checking prettier and eslint rules
   - `npm run styleguide:fix` for fixing prettier and eslint issues



