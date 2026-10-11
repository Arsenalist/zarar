---
title: "Why are dark deployments a good idea even if no features are being shipped?"
date: 2025-12-03T19:29Z
---

1.  They allow for early testing of features against production data to a small set of users (e.g, developers, QE, business). Test environments are a mediocre substitute for the realities of the wild. High-performing teams have the ability to test isolated components and features in production to gain confidence before eventual customer-facing releases.
    
2.  Dark deployments are an investment and a continuous test of the reliability of the deployment and change management pipeline (e.g., K8 processes, build pipelines, configuration management). They reduce the risk of public failures and build the confidence necessary to scale to customer-facing releases. The more we go through the pipeline, the more we are able to tune it and improve it. 
    
3.  They validate infrastructure and technical cloud components (e.g., schedulers, storage, network, vaults, configuration/environment variables), reducing the risk of eventual go-live to near zero. These are technical goals that directly impact the reliability of the system.  
    
4.  They result in smaller deployments which can be done during business hours as batch sizes become smaller compared to big bang. The smaller the change, the less the risk, and the easier it is to validate. This leads to better overall team health and reduced stress as well. The eventual release to customers becomes a simple change.
    
5.  They help reduce technical debt as you can address outdated code, inefficient processes/modules in small isolated changes. This keeps the technical stack maintainable and "in sync" with production rather than essentially maintaining two copies of the code. This results in a huge productivity boost with the teams because they spend much less time managing and merging code.
    
6.  When teams deploy often, the act of deploying becomes routine as we get better at it, and the focus shifts to what is being deployed rather than the process. This mindset encourages teams to prioritize value delivery as opposed to fear/avoid deployments. Teams start seeking out what value can be delivered instead of complacently defaulting to a release months from now.
    
7.  Deploying often demands close coordination between developers, DevOps, and business/product. This collaboration builds trust and aligns priorities, making it easier to transition to customer-facing releases. The avoids working in isolation for long periods of time and continuously aligns people to value.
