FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates

# تحميل النسخة الرسمية المتوافقة من موقع PocketBase
ARG PB_VERSION=0.40.2
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip

# نسخ المخطط والترحيلات بمرونة (سواء تم البناء من جذر المشروع أو من مجلد backend-pocketbase)
COPY . /tmp/context/
RUN mkdir -p /pb/pb_migrations /pb/pb_data && \
    if [ -d "/tmp/context/pb_migrations" ]; then \
        cp -rf /tmp/context/pb_migrations/* /pb/pb_migrations/ 2>/dev/null || true; \
    elif [ -d "/tmp/context/backend-pocketbase/pb_migrations" ]; then \
        cp -rf /tmp/context/backend-pocketbase/pb_migrations/* /pb/pb_migrations/ 2>/dev/null || true; \
    fi && \
    if [ -f "/tmp/context/pb_schema.json" ]; then \
        cp -f /tmp/context/pb_schema.json /pb/pb_schema.json; \
    elif [ -f "/tmp/context/backend-pocketbase/pb_schema.json" ]; then \
        cp -f /tmp/context/backend-pocketbase/pb_schema.json /pb/pb_schema.json; \
    fi && \
    rm -rf /tmp/context

EXPOSE 8080

# تشغيل السيرفر مع الترحيل التلقائي
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb/pb_data", "--migrationsDir=/pb/pb_migrations"]
